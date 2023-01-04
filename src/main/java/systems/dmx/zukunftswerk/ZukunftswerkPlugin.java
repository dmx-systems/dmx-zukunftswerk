package systems.dmx.zukunftswerk;

import static systems.dmx.accesscontrol.Constants.*;
import static systems.dmx.core.Constants.*;
import static systems.dmx.files.Constants.*;
import static systems.dmx.signup.Constants.*;
import static systems.dmx.topicmaps.Constants.*;
import static systems.dmx.workspaces.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.accesscontrol.AccessControlService;
import systems.dmx.core.Assoc;
import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.model.ChildTopicsModel;
import systems.dmx.core.model.SimpleValue;
import systems.dmx.core.model.TopicModel;
import systems.dmx.core.model.topicmaps.ViewProps;
import systems.dmx.core.osgi.PluginActivator;
import systems.dmx.core.service.ChangeReport;
import systems.dmx.core.service.ChangeReport.Change;
import systems.dmx.core.service.Cookies;
import systems.dmx.core.service.Inject;
import systems.dmx.core.service.Transactional;
import systems.dmx.core.service.accesscontrol.PrivilegedAccess;
import systems.dmx.core.service.accesscontrol.SharingMode;
import systems.dmx.core.service.event.PostCreateAssoc;
import systems.dmx.core.service.event.PostUpdateTopic;
import systems.dmx.core.service.event.PreDeleteAssoc;
import systems.dmx.core.service.event.PreSendTopic;
import systems.dmx.core.util.DMXUtils;
import systems.dmx.core.util.IdList;
import systems.dmx.deepl.DeepLService;
import systems.dmx.deepl.Translation;
import systems.dmx.facets.FacetsService;
import systems.dmx.sendmail.SendmailService;
import systems.dmx.signup.SignupService;
import systems.dmx.timestamps.TimestampsService;
import systems.dmx.topicmaps.TopicmapCustomizer;
import systems.dmx.topicmaps.TopicmapsService;
import systems.dmx.workspaces.WorkspacesService;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.Produces;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.function.Consumer;
import java.util.logging.Logger;
import java.util.stream.Collectors;



@Path("/zukunftswerk")
@Produces("application/json")
public class ZukunftswerkPlugin extends PluginActivator implements ZukunftswerkService, TopicmapCustomizer,
                                                                                        PostCreateAssoc,
                                                                                        PostUpdateTopic,
                                                                                        PreDeleteAssoc,
                                                                                        PreSendTopic {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    @Inject private DeepLService deepls;
    @Inject private TimestampsService timestamps;
    @Inject private TopicmapsService tms;
    @Inject private WorkspacesService ws;
    @Inject private AccessControlService acs;
    @Inject private FacetsService facets;
    @Inject private SignupService signup;
    @Inject private SendmailService sendmail;

    private Topic zwPluginTopic;
    private Topic teamWorkspace;
    private Messenger me;
    private Random random = new Random();

    private Logger logger = Logger.getLogger(getClass().getName());

    // -------------------------------------------------------------------------------------------------- Public Methods

    // Hooks

    @Override
    public void init() {
        zwPluginTopic = dmx.getTopicByUri(ZW_PLUGIN_URI);
        teamWorkspace = dmx.getTopicByUri(TEAM_WORKSPACE_URI);
        tms.registerTopicmapCustomizer(this);
        me = new Messenger(dmx.getWebSocketService());
        new EmailDigests(dmx, acs, ws, timestamps, sendmail, teamWorkspace).startTimedTask();
    }

    @Override
    public void shutdown() {
        tms.unregisterTopicmapCustomizer(this);
    }

    // Listeners

    /**
     * Creates required memberships for new Team members.
     */
    @Override
    public void postCreateAssoc(Assoc assoc) {
        processTeamMembership(assoc, username -> {
            // 1) Create "System" membership
            logger.info("### Inviting user \"" + username + "\" to \"System\" workspace");
            acs.createMembership(username, dmx.getPrivilegedAccess().getSystemWorkspaceId());
            // 2) Create ZW event workspace memberships
            List<RelatedTopic> workspaces = getAllZWWorkspaces();
            logger.info("### Inviting user \"" + username + "\" to " + workspaces.size() + " ZW workspaces");
            acs.bulkUpdateMemberships(username, new IdList(workspaces), null);
        });
    }

    /**
     * Deletes "System" membership for users who loose Team status.
     */
    @Override
    public void preDeleteAssoc(Assoc assoc) {
        processTeamMembership(assoc, username -> {
            // Delete "System" membership
            logger.info("### Removing \"System\" membership from user \"" + username + "\"");
            acs.getMembership(username, dmx.getPrivilegedAccess().getSystemWorkspaceId()).delete();
            // Note: when a user looses Team status we don't know in which ZW workspaces she stays.
            // We leave all memberships intact.
        });
    }

    /**
     * Sets "Translation Edited" flag once auto-translated text is edited.
     */
    @Override
    public void postUpdateTopic(Topic topic, ChangeReport report, TopicModel updateModel) {
        if (topic.getTypeUri().equals(COMMENT)) {
            String origLang = topic.getChildTopics().getString(LANGUAGE + "#" + ORIGINAL_LANGUAGE, null);
            // Note: a monolingual comment has no "Original Language"
            if (origLang != null) {
                List<Change> changes = report.getChanges(COMMENT + "." + targetLang(origLang));
                if (changes != null) {
                    topic.update(mf.newChildTopicsModel().set(TRANSLATION_EDITED, true));
                }
            }
        }
    }

    /**
     * Enriches:
     * - Comments by "Creator"
     *   - Comment-Refs by "Creator"
     *   - Textblock-Refs by "Color"
     * - Worksapces by "Owner"
     * - Usernames by "Display Name" and "Show Email Address" flag
     * - Memberships by "Editor" flag
     */
    @Override
    public void preSendTopic(Topic topic) {
        String typeUri = topic.getTypeUri();
        if (typeUri.equals(COMMENT)) {
            acs.enrichWithUserInfo(topic);
            Topic refComment = topic.getChildTopics().getTopicOrNull(COMMENT);
            if (refComment != null) {
                acs.enrichWithUserInfo(refComment);
            }
            Topic refTextblock = topic.getChildTopics().getTopicOrNull(TEXTBLOCK);
            if (refTextblock != null) {
                enrichWithColor(refTextblock);
            }
        } else if (typeUri.equals(WORKSPACE)) {
            acs.enrichWithOwnerInfo(topic);
        } else if (typeUri.equals(USERNAME)) {
            String username = topic.getSimpleValue().toString();
            ChildTopicsModel topics = topic.getChildTopics().getModel();
            String displayName = signup.getDisplayName(username);
            if (displayName != null) {
                topics.set(DISPLAY_NAME, displayName);
            }
            topics.set(SHOW_EMAIL_ADDRESS, getShowEmailAddress(username));
        }
        // Note: in a Related Username Topic w/ a Membership *both* are enriched
        if (topic instanceof RelatedTopic) {
            Assoc assoc = ((RelatedTopic) topic).getRelatingAssoc();
            if (assoc.getTypeUri().equals(MEMBERSHIP)) {
                Topic editor = facets.getFacet(assoc, EDITOR_FACET);
                if (editor != null) {
                    String[] a = editor.getSimpleValue().toString().split(":");
                    boolean isEditor = Boolean.parseBoolean(a[1]);
                    assoc.getChildTopics().getModel().set(EDITOR, isEditor);
                }
            }
        }
    }

    // TopicmapCustomizer
    //
    // Note: as Topicmap is not a DMXObject no PRE_SEND event is fired, so we use a TopicmapCustomizer to enrich
    // the topic's view properties.

    /**
     * Enriches:
     * - Documents, Notes, Textblocks, Labels, and Arrows by "Angle"
     * - Notes and Textblocks by "Color"
     * - Viewports by "Zoom"
     */
    @Override
    public void customizeTopic(RelatedTopic topic, ViewProps viewProps) {
        Assoc assoc = topic.getRelatingAssoc();
        String typeUri = topic.getTypeUri();
        if (typeUri.equals(DOCUMENT) || typeUri.equals(ZW_NOTE) || typeUri.equals(TEXTBLOCK)
                                     || typeUri.equals(LABEL) || typeUri.equals(ARROW)) {
            if (assoc.hasProperty(ANGLE)) {         // Angle is an optional view prop
                viewProps.set(ANGLE, assoc.getProperty(ANGLE));
            }
        }
        if (typeUri.equals(ZW_NOTE) || typeUri.equals(TEXTBLOCK)) {
            if (assoc.hasProperty(ZW_COLOR)) {      // Color is an optional view prop
                // Note: we store the color not as a view prop but in the topic model (as a synthetic child value)
                // because textblocks are rendered not only on canvas, but also in discussion panel, namely as colored
                // textblock-refs. In contrast for notes view props could be used, but we want handle color uniformly.
                topic.getChildTopics().getModel().set(ZW_COLOR, assoc.getProperty(ZW_COLOR));
            }
        } else if (typeUri.equals(VIEWPORT)) {
            viewProps.set(ZOOM, assoc.getProperty(ZOOM));
        }
    }

    // ZukunftswerkService

    @GET
    @Path("/workspaces")
    @Override
    public List<RelatedTopic> getZWWorkspaces() {
        try {
            // FIXME: public workspaces (w/o Membership) are not supported
            Topic username = acs.getUsernameTopic();
            if (username != null) {
                return getZWWorkspaces(username);
            } else {
                return new ArrayList();
            }
        } catch (Exception e) {
            throw new RuntimeException("Retrieving the user's ZW workspaces failed", e);
        }
    }

    @GET
    @Path("/discussion")
    @Override
    public List<Topic> getDiscussion() {
        try {
            return DMXUtils.loadChildTopics(
                ws.getAssignedTopics(workspaceId(), COMMENT)
            );
        } catch (Exception e) {
            throw new RuntimeException("Retrieving the discussion for workspace " + workspaceId() + " failed", e);
        }
    }

    @GET
    @Path("/users")
    @Override
    public List<Topic> getAllUsers() {
        try {
            return dmx.getTopicsByType(USERNAME);
        } catch (Exception e) {
            throw new RuntimeException("Retrieving all ZW users failed", e);
        }
    }

    @POST
    @Path("/document")
    @Transactional
    @Override
    public Topic createDocument(String docName, @QueryParam("fileId") long fileId) {
        try {
            TopicModel document = createBilingualTopicModel(DOCUMENT, docName, DOCUMENT_NAME);
            String lang = document.getChildTopics().getString(LANGUAGE + "#" + ORIGINAL_LANGUAGE);
            document.getChildTopics().setRef(FILE + "#zukunftswerk." + lang, fileId);
            return dmx.createTopic(document);
        } catch (Exception e) {
            throw new RuntimeException("Creating document failed, docName=\"" + docName + "\", fileId=" + fileId, e);
        }
    }

    @POST
    @Path("/note")
    @Transactional
    @Override
    public Topic createNote(String note) {
        try {
            return dmx.createTopic(createBilingualTopicModel(ZW_NOTE, note));
        } catch (Exception e) {
            throw new RuntimeException("Creating note failed, note=\"" + note + "\"", e);
        }
    }

    @POST
    @Path("/textblock")
    @Transactional
    @Override
    public Topic createTextblock(String textblock) {
        try {
            return dmx.createTopic(createBilingualTopicModel(TEXTBLOCK, textblock));
        } catch (Exception e) {
            throw new RuntimeException("Creating textblock failed, textblock=\"" + textblock + "\"", e);
        }
    }

    @POST
    @Path("/label")
    @Transactional
    @Override
    public Topic createLabel(String label) {
        try {
            return dmx.createTopic(createBilingualTopicModel(LABEL, label));
        } catch (Exception e) {
            throw new RuntimeException("Creating label failed, label=\"" + label + "\"", e);
        }
    }

    @POST
    @Path("/comment")
    @Transactional
    @Override
    public Topic createComment(String comment, @QueryParam("refTopicIds") IdList refTopicIds,
                                               @QueryParam("fileTopicIds") IdList fileTopicIds) {
        try {
            return _createComment(createBilingualTopicModel(COMMENT, comment), refTopicIds, fileTopicIds);
        } catch (Exception e) {
            throw new RuntimeException("Creating comment failed, refTopicIds=" + refTopicIds + ", fileTopicIds=" +
                fileTopicIds, e);
        }
    }

    @POST
    @Path("/comment/monolingual")
    @Transactional
    @Override
    public Topic createMonolingualComment(String comment, @QueryParam("refTopicIds") IdList refTopicIds,
                                                          @QueryParam("fileTopicIds") IdList fileTopicIds) {
        try {
            // Note: a monolingual comment is stored in "de". "fr" and "Original Language" are not set.
            return _createComment(mf.newTopicModel(COMMENT, mf.newChildTopicsModel()
                .set(COMMENT_DE, comment)
            ), refTopicIds, fileTopicIds);
        } catch (Exception e) {
            throw new RuntimeException("Creating monolingual comment failed, refTopicIds=" + refTopicIds +
                ", fileTopicIds=" + fileTopicIds, e);
        }
    }

    @Override
    public Topic createViewport(long workspaceId) {
        List<Topic> topicmaps = ws.getAssignedTopics(workspaceId, TOPICMAP);
        if (topicmaps.size() != 1) {
            throw new RuntimeException("Workspace " + workspaceId + " has " + topicmaps.size() +
                " topicmaps (expected is 1)");
        }
        long topicmapId = topicmaps.get(0).getId();
        Topic viewport = dmx.createTopic(mf.newTopicModel(VIEWPORT, new SimpleValue("Viewport " + random.nextLong())));
        ViewProps viewProps = mf.newViewProps(0, 0, true, false);
        viewProps.set(ZOOM, 1);
        tms.addTopicToTopicmap(topicmapId, viewport.getId(), viewProps);
        return viewport;
    }

    @POST
    @Path("/translate")
    @Override
    public Translation translate(String text, @QueryParam("targetLang") String targetLang) {
        try {
            if (targetLang == null) {
                // "en" acts as dummy language, not used in this application.
                // This translation's sole purpose is language detection for the original text.
                Translation translation = deepls.translate(text, "en").get(0);
                String origLang = translation.detectedSourceLang;
                targetLang = targetLang(origLang);
            }
            // actual translation
            return deepls.translate(text, targetLang).get(0);
        } catch (Exception e) {
            throw new RuntimeException("Translation failed, text=\"" + text + "\", targetLang=" + targetLang, e);
        }
    }

    @PUT
    @Path("/user_profile")
    @Transactional
    @Override
    public void updateUserProfile(@QueryParam("displayName") String displayName,
                                  @QueryParam("showEmailAddress") boolean showEmailAddress) {
        String username = acs.getUsername();
        signup.updateDisplayName(username, displayName);
        updateShowEmailAddressFacet(username, showEmailAddress);
    }

    // --- Admin ---

    @GET
    @Path("/admin/workspaces")
    @Override
    public List<RelatedTopic> getAllZWWorkspaces() {
        try {
            return DMXUtils.loadChildTopics(
                // We retrieve the Plugin topic on-the-fly to allow this method to be called from a migration.
                // Note: migrations run *before* the plugin's init hook is triggered, so we can't rely on
                // "zwPluginTopic" here as it is not yet initialized.
                dmx.getTopicByUri(ZW_PLUGIN_URI).getRelatedTopics(SHARED_WORKSPACE, DEFAULT, DEFAULT, WORKSPACE)
            );
        } catch (Exception e) {
            throw new RuntimeException("Retrieving all ZW workspaces failed", e);
        }
    }

    @GET
    @Path("/admin/user/{username}/workspaces")
    @Override
    public List<RelatedTopic> getZWWorkspacesOfUser(@PathParam("username") String username) {
        try {
            Topic usernameTopic = acs.getUsernameTopic(username);
            if (usernameTopic == null) {
                throw new IllegalArgumentException("No such user: \"" + username + "\"");
            }
            List<RelatedTopic> workspaces = getZWWorkspaces(usernameTopic);
            Assoc membership = acs.getMembership(username, teamWorkspace.getId());
            if (membership != null) {
                workspaces.add(membership.getDMXObjectByType(WORKSPACE).loadChildTopics());
            }
            return workspaces;
        } catch (Exception e) {
            throw new RuntimeException("Retrieving ZW workspaces of user \"" + username + "\" failed", e);
        }
    }

    @Override
    public List<RelatedTopic> getZWTeamMembers() {
        return acs.getMemberships(teamWorkspace.getId());
    }

    @PUT
    @Path("/admin/workspace/{workspaceId}")
    @Transactional
    @Override
    public List<RelatedTopic> bulkUpdateWorkspaceMemberships(@PathParam("workspaceId") long workspaceId,
                                                             @QueryParam("addUserIds1") IdList addUserIds1,
                                                             @QueryParam("removeUserIds1") IdList removeUserIds1,
                                                             @QueryParam("addUserIds2") IdList addUserIds2,
                                                             @QueryParam("removeUserIds2") IdList removeUserIds2) {
        try {
            // 1) Update Memberships
            List<RelatedTopic> users = acs.bulkUpdateMemberships(workspaceId, addUserIds1, removeUserIds1);
            // 2) Update Editor role
            if (removeUserIds2 != null) {
                for (long userId : removeUserIds2) {
                    updateEditorFacet(userId, workspaceId, false);
                }
            }
            if (addUserIds2 != null) {
                for (long userId : addUserIds2) {
                    updateEditorFacet(userId, workspaceId, true);
                }
            }
            return users;
        } catch (Exception e) {
            throw new RuntimeException("Editor role bulk update for ZW workspace " + workspaceId + " failed", e);
        }
    }

    @PUT
    @Path("/admin/user/{username}")
    @Transactional
    @Override
    public List<RelatedTopic> bulkUpdateUserMemberships(@PathParam("username") String username,
                                                        @QueryParam("addWorkspaceIds1") IdList addWorkspaceIds1,
                                                        @QueryParam("removeWorkspaceIds1") IdList removeWorkspaceIds1,
                                                        @QueryParam("addWorkspaceIds2") IdList addWorkspaceIds2,
                                                        @QueryParam("removeWorkspaceIds2") IdList removeWorkspaceIds2) {
        try {
            // 1) Update Memberships
            acs.bulkUpdateMemberships(username, addWorkspaceIds1, removeWorkspaceIds1);
            // 2) Update Editor role
            if (removeWorkspaceIds2 != null) {
                for (long wsId : removeWorkspaceIds2) {
                    updateEditorFacet(username, wsId, false);
                }
            }
            if (addWorkspaceIds2 != null) {
                for (long wsId : addWorkspaceIds2) {
                    updateEditorFacet(username, wsId, true);
                }
            }
            return getZWWorkspacesOfUser(username);
        } catch (Exception e) {
            throw new RuntimeException("Editor role bulk update for user \"" + username + "\" failed", e);
        }
    }

    @POST
    @Path("/admin/workspace")
    @Transactional
    @Override
    public Topic createZWWorkspace(@QueryParam("nameDe") String nameDe, @QueryParam("nameFr") String nameFr) {
        try {
            // 1) Create workspace
            Topic workspace = ws.createWorkspace(nameDe, null, SharingMode.COLLABORATIVE);
            workspace.update(mf.newChildTopicsModel()
                .set(WORKSPACE_NAME + "#" + DE, nameDe)
                .set(WORKSPACE_NAME + "#" + FR, nameFr)
            );
            // 2) Mark it as "ZW Shared Workspace"
            long workspaceId = workspace.getId();
            dmx.getPrivilegedAccess().runInWorkspaceContext(workspaceId, () -> {
                dmx.createAssoc(mf.newAssocModel(
                    SHARED_WORKSPACE,
                    mf.newTopicPlayerModel(ZW_PLUGIN_URI, DEFAULT),
                    mf.newTopicPlayerModel(workspaceId, DEFAULT)
                ));
                return null;
            });
            // 3)
            createViewport(workspaceId);
            // 4) Give all "Team" members access
            List<RelatedTopic> usernames = getZWTeamMembers();
            logger.info("### Inviting " + usernames.size() + " Team members to workspace \"" +
                workspace.getSimpleValue() + "\"");
            acs.bulkUpdateMemberships(workspaceId, new IdList(usernames), null);
            return workspace;
        } catch (Exception e) {
            throw new RuntimeException("Creating a ZW workspace failed", e);
        }
    }



    // ------------------------------------------------------------------------------------------------- Private Methods

    private TopicModel createBilingualTopicModel(String topicTypeUri, String text) {
        return createBilingualTopicModel(topicTypeUri, text, topicTypeUri);
    }

    private TopicModel createBilingualTopicModel(String topicTypeUri, String text, String childTypeUri) {
        Translation translation = translate(text, null);
        String origLang = translation.detectedSourceLang;
        String targetLang = targetLang(origLang);
        return mf.newTopicModel(topicTypeUri, mf.newChildTopicsModel()
            .set(childTypeUri + "." + origLang, text)
            .set(childTypeUri + "." + targetLang, translation.text)
            .set(LANGUAGE + "#" + ORIGINAL_LANGUAGE, origLang)
        );
    }

    private String targetLang(String origLang) {
        if (origLang.equals("de")) {
            return "fr";
        } else if (origLang.equals("fr")) {
            return "de";
        } else {
            // Note: the regex in confirmCreate() (zw-discussion.vue) must match this message
            throw new RuntimeException("Unsupported original language: \"" + origLang + "\" (detected)");
        }
    }

    private Topic _createComment(TopicModel commentModel, IdList refTopicIds, IdList fileTopicIds) {
        // add comment/document ref
        if (refTopicIds != null) {
            for (long refTopicId : refTopicIds) {
                String compDefUri = dmx.getTopic(refTopicId).getTypeUri();
                commentModel.getChildTopics().setRef(compDefUri, refTopicId);
            }
        }
        // add attachments
        if (fileTopicIds != null) {
            for (long fileTopicId : fileTopicIds) {
                commentModel.getChildTopics().addRef(FILE + "#" + ATTACHMENT, fileTopicId);
            }
        }
        //
        Topic commentTopic = dmx.createTopic(commentModel);
        acs.enrichWithUserInfo(commentTopic);
        timestamps.enrichWithTimestamps(commentTopic);
        me.addComment(workspaceId(), commentTopic);
        return commentTopic;
    }

    private void enrichWithColor(Topic topic) {
        long topicmapId = topicmapId();
        Assoc assoc = tms.getTopicMapcontext(topicmapId, topic.getId());
        if (assoc == null) {
            throw new RuntimeException(topic.getTypeUri() + " topic " + topic.getId() + " not in topicmap " +
                topicmapId);
        }
        if (assoc.hasProperty(ZW_COLOR)) {      // Color is an optional view prop
            topic.getChildTopics().getModel().set(ZW_COLOR, assoc.getProperty(ZW_COLOR));
        }
    }

    private void processTeamMembership(Assoc assoc, Consumer<String> consumer) {
        if (assoc.getTypeUri().equals(MEMBERSHIP)) {
            Topic workspace = assoc.getDMXObjectByType(WORKSPACE);
            if (workspace.getUri().equals(TEAM_WORKSPACE_URI)) {
                String username = assoc.getDMXObjectByType(USERNAME).getSimpleValue().toString();
                consumer.accept(username);
            }
        }
    }

    private List<RelatedTopic> getZWWorkspaces(Topic username) {
        return DMXUtils.loadChildTopics(
            username.getRelatedTopics(MEMBERSHIP, DEFAULT, DEFAULT, WORKSPACE)
                .stream().filter(this::isZWWorkspace).collect(Collectors.toList())
        );
    }

    private boolean isZWWorkspace(Topic workspace) {
        return dmx.getAssocBetweenTopicAndTopic(
            SHARED_WORKSPACE, workspace.getId(), zwPluginTopic.getId(), DEFAULT, DEFAULT
        ) != null;
    }

    private long workspaceId() {
        return Cookies.get().getLong("dmx_workspace_id");
    }

    private long topicmapId() {
        return Cookies.get().getLong("dmx_topicmap_id");
    }

    // convenience
    private void updateEditorFacet(long userId, long workspaceId, boolean editor) throws Exception {
        updateEditorFacet(getUsername(userId), workspaceId, editor);
    }

    private void updateEditorFacet(String username, long workspaceId, boolean editor) throws Exception {
        dmx.getPrivilegedAccess().runInWorkspaceContext(workspaceId, () -> {
            Assoc assoc = acs.getMembership(username, workspaceId);
            if (assoc != null) {
                facets.updateFacet(assoc, EDITOR_FACET, mf.newFacetValueModel(EDITOR).set(workspaceId + ":" + editor));
            }
            return null;
        });
    }

    private boolean getShowEmailAddress(String username) {
        try {
            Topic usernameTopic = acs.getUsernameTopic(username);
            Topic showEmailAddress = facets.getFacet(usernameTopic, SHOW_EMAIL_ADDRESS_FACET);
            if (showEmailAddress != null) {
                return showEmailAddress.getSimpleValue().booleanValue();
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Fetching \"Show Email Address\" flag of user \"" + username + "\" failed", e);
        }
    }

    private void updateShowEmailAddressFacet(String username, boolean showEmailAddress) {
        try {
            PrivilegedAccess pa = dmx.getPrivilegedAccess();
            pa.runInWorkspaceContext(getDisplayNamesWorkspaceId(), () -> {
                Topic usernameTopic = acs.getUsernameTopic(username);
                if (usernameTopic != null) {
                    facets.updateFacet(usernameTopic, SHOW_EMAIL_ADDRESS_FACET,
                        mf.newFacetValueModel(SHOW_EMAIL_ADDRESS).set(showEmailAddress)
                    );
                }
                return null;
            });
        } catch (Exception e) {
            throw new RuntimeException("Updating \"Show Email Address\" flag (" + showEmailAddress + ") of user \"" +
                username + "\" failed", e);
        }
    }

    /**
     * @param   id      ID of an Username topic
     */
    private String getUsername(long id) {       // ### Copied from AccessControlPlugin.java
        Topic username = dmx.getTopic(id);
        String typeUri = username.getTypeUri();
        if (!typeUri.equals(USERNAME)) {
            throw new IllegalArgumentException("Topic " + id + " is not a Username (but a \"" + typeUri + "\")");
        }
        return username.getSimpleValue().toString();
    }

    private long getDisplayNamesWorkspaceId() {
        return dmx.getTopicByUri(DISPLAY_NAME_WS_URI).getId();
    }
}
