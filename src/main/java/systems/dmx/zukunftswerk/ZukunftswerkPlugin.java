package systems.dmx.zukunftswerk;

import static systems.dmx.accesscontrol.Constants.*;
import static systems.dmx.core.Constants.*;
import static systems.dmx.files.Constants.*;
import static systems.dmx.workspaces.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.accesscontrol.AccessControlService;
import systems.dmx.core.Assoc;
import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.model.TopicModel;
import systems.dmx.core.osgi.PluginActivator;
import systems.dmx.core.service.ChangeReport;
import systems.dmx.core.service.ChangeReport.Change;
import systems.dmx.core.service.Cookies;
import systems.dmx.core.service.Inject;
import systems.dmx.core.service.Transactional;
import systems.dmx.core.service.accesscontrol.SharingMode;
import systems.dmx.core.service.event.PostUpdateTopic;
import systems.dmx.core.service.event.PreSendTopic;
import systems.dmx.core.util.DMXUtils;
import systems.dmx.core.util.IdList;
import systems.dmx.deepl.DeepLService;
import systems.dmx.deepl.Translation;
import systems.dmx.sendmail.SendmailService;
import systems.dmx.signup.SignupService;
import systems.dmx.timestamps.TimestampsService;
import systems.dmx.workspaces.WorkspacesService;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.Produces;
import javax.ws.rs.Consumes;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;



@Path("/zukunftswerk")
@Produces("application/json")
public class ZukunftswerkPlugin extends PluginActivator implements ZukunftswerkService, PostUpdateTopic, PreSendTopic {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    @Inject private DeepLService deepls;
    @Inject private TimestampsService ts;
    @Inject private WorkspacesService ws;
    @Inject private AccessControlService acs;
    @Inject private SignupService signup;
    @Inject private SendmailService sendmail;

    private Topic zwPluginTopic;
    private Topic teamWorkspace;
    private Messenger me;

    private Logger logger = Logger.getLogger(getClass().getName());

    // -------------------------------------------------------------------------------------------------- Public Methods

    // Hooks

    @Override
    public void init() {
        zwPluginTopic = dmx.getTopicByUri(ZW_PLUGIN_URI);
        teamWorkspace = dmx.getTopicByUri(TEAM_WORKSPACE_URI);
        me = new Messenger(dmx.getWebSocketService());
    }

    // Listeners

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

    @Override
    public void preSendTopic(Topic topic) {
        if (topic.getTypeUri().equals(COMMENT)) {
            acs.enrichWithUserInfo(topic);
            Topic refComment = topic.getChildTopics().getTopicOrNull(COMMENT);
            if (refComment != null) {
                acs.enrichWithUserInfo(refComment);
            }
        } else if (topic.getTypeUri().equals(USERNAME)) {
            String username = topic.getSimpleValue().toString();
            String displayName = signup.getDisplayName(username);
            if (displayName != null) {
                topic.getChildTopics().getModel().set(DISPLAY_NAME, displayName);
            }
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

    @POST
    @Path("/note")
    @Consumes("text/plain")
    @Transactional
    @Override
    public Topic createNote(String note) {
        try {
            return dmx.createTopic(createBilingualTopicModel(NOTE, note));
        } catch (Exception e) {
            throw new RuntimeException("Creating note failed, note=\"" + note + "\"", e);
        }
    }

    @POST
    @Path("/label")
    @Consumes("text/plain")
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
    @Consumes("text/plain")
    @Transactional
    @Override
    public Topic createComment(String comment, @QueryParam("refTopicIds") IdList refTopicIds,
                                               @QueryParam("fileTopicIds") IdList fileTopicIds) {
        try {
            return _createComment(createBilingualTopicModel(COMMENT, comment), refTopicIds, fileTopicIds);
        } catch (Exception e) {
            throw new RuntimeException("Creating comment failed, comment=\"" + comment + "\", refTopicIds=" +
                refTopicIds + ", fileTopicIds=" + fileTopicIds, e);
        }
    }

    @POST
    @Path("/comment/monolingual")
    @Consumes("text/plain")
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
            throw new RuntimeException("Creating monolingual comment failed, comment=\"" + comment +
                "\", refTopicIds=" + refTopicIds + ", fileTopicIds=" + fileTopicIds, e);
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

    // --- Admin ---

    @GET
    @Path("/admin/workspaces")
    @Override
    public List<RelatedTopic> getAllZWWorkspaces() {
        try {
            return DMXUtils.loadChildTopics(
                zwPluginTopic.getRelatedTopics(SHARED_WORKSPACE, DEFAULT, DEFAULT, WORKSPACE)
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
                workspaces.add(membership.getDMXObjectByType(WORKSPACE));
            }
            return workspaces;
        } catch (Exception e) {
            throw new RuntimeException("Retrieving ZW workspaces of user \"" + username + "\" failed", e);
        }
    }

    @POST
    @Path("/admin/workspace")
    @Transactional
    @Override
    public Topic createZWWorkspace(@QueryParam("nameDe") String nameDe, @QueryParam("nameFr") String nameFr) {
        try {
            Topic workspace = ws.createWorkspace(nameDe, null, SharingMode.COLLABORATIVE);
            workspace.update(mf.newChildTopicsModel()
                .set(WORKSPACE_NAME + "#" + DE, nameDe)
                .set(WORKSPACE_NAME + "#" + FR, nameFr)
            );
            dmx.createAssoc(mf.newAssocModel(
                SHARED_WORKSPACE,
                mf.newTopicPlayerModel(ZW_PLUGIN_URI, DEFAULT),
                mf.newTopicPlayerModel(workspace.getId(), DEFAULT)
            ));
            return workspace;
        } catch (Exception e) {
            throw new RuntimeException("Creating a ZW workspace failed", e);
        }
    }



    // ------------------------------------------------------------------------------------------------- Private Methods

    private TopicModel createBilingualTopicModel(String topicTypeUri, String text) {
        // "en" acts as dummy language, not used in this application.
        // This translation's sole purpose is language detection for the original text.
        Translation translation = deepls.translate(text, "en").get(0);
        String origLang = translation.detectedSourceLang.toLowerCase();
        String targetLang = targetLang(origLang);
        // translate comment
        String translatedComment = deepls.translate(text, targetLang).get(0).text;
        //
        return mf.newTopicModel(topicTypeUri, mf.newChildTopicsModel()
            .set(topicTypeUri + "." + origLang, text)
            .set(topicTypeUri + "." + targetLang, translatedComment)
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
                String refTypeUri = dmx.getTopic(refTopicId).getTypeUri();
                commentModel.getChildTopics().setRef(refTypeUri, refTopicId);
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
        ts.enrichWithTimestamps(commentTopic);
        me.addComment(workspaceId(), commentTopic);
        sendNotificationMail(commentTopic);
        return commentTopic;
    }

    private void sendNotificationMail(Topic comment) {
        String commentDe = comment.getChildTopics().getString(COMMENT_DE);
        String commentFr = comment.getChildTopics().getString(COMMENT_FR, "");
        String workspace = dmx.getTopic(workspaceId()).getSimpleValue().toString();
        String creator   = comment.getChildTopics().getString(CREATOR);
        String message = "NEW COMMENT\r\rWorkspace: " + workspace + "\r\rAuthor: " + creator +
            "\r\r----------------" + commentDe + "\r----------------" + commentFr;
        sendmail.doEmailRecipient("ZW Activity", message, "jri@dmx.berlin");
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
}
