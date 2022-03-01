package systems.dmx.zukunftswerk;

import static systems.dmx.core.Constants.*;
import static systems.dmx.files.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.accesscontrol.AccessControlService;
import systems.dmx.core.Topic;
import systems.dmx.core.model.TopicModel;
import systems.dmx.core.osgi.PluginActivator;
import systems.dmx.core.service.Cookies;
import systems.dmx.core.service.Inject;
import systems.dmx.core.service.Transactional;
import systems.dmx.core.service.event.PreSendTopic;
import systems.dmx.core.util.DMXUtils;
import systems.dmx.core.util.IdList;
import systems.dmx.deepl.DeepLService;
import systems.dmx.deepl.Translation;
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

import java.util.List;
import java.util.logging.Logger;



@Path("/zukunftswerk")
@Produces("application/json")
public class ZukunftswerkPlugin extends PluginActivator implements ZukunftswerkService, PreSendTopic {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    @Inject private DeepLService deepls;
    @Inject private TimestampsService ts;
    @Inject private WorkspacesService ws;           // needed by migration 2
    @Inject private AccessControlService acs;       // needed by migration 2

    private Messenger me;

    private Logger logger = Logger.getLogger(getClass().getName());

    // -------------------------------------------------------------------------------------------------- Public Methods

    // Hooks

    @Override
    public void init() {
        me = new Messenger(dmx.getWebSocketService());
    }

    // Listeners

    @Override
    public void preSendTopic(Topic topic) {
        if (topic.getTypeUri().equals(COMMENT)) {
            acs.enrichWithUserInfo(topic);
            Topic refComment = topic.getChildTopics().getTopicOrNull(COMMENT);
            if (refComment != null) {
                acs.enrichWithUserInfo(refComment);
            }
        }
    }

    // ZukunftswerkService

    @GET
    @Path("/discussion")
    @Override
    public List<Topic> getDiscussion() {
        return DMXUtils.loadChildTopics(
            ws.getAssignedTopics(workspaceId(), COMMENT)
        );
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
            TopicModel commentModel = createBilingualTopicModel(COMMENT, comment);
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
            return commentTopic;
        } catch (Exception e) {
            throw new RuntimeException("Creating comment failed, refTopicIds=" + refTopicIds + ", fileTopicIds=" +
                fileTopicIds, e);
        }
    }

    // ------------------------------------------------------------------------------------------------- Private Methods

    private TopicModel createBilingualTopicModel(String topicTypeUri, String text) {
        // "en" acts as dummy language, not used in this application.
        // This translation's sole purpose is language detection of the original text.
        Translation translation = deepls.translate(text, "en").get(0);
        String origLang = translation.detectedSourceLang.toLowerCase();
        logger.info("origLang=\"" + origLang + "\"");
        String targetLang;
        if (origLang.equals("de")) {
            targetLang = "fr";
        } else if (origLang.equals("fr")) {
            targetLang = "de";
        } else {
            throw new RuntimeException("Unsupported original language: \"" + origLang + "\" (detected)");
        }
        // translate comment
        String translatedComment = deepls.translate(text, targetLang).get(0).text;
        //
        return mf.newTopicModel(topicTypeUri, mf.newChildTopicsModel()
            .set(topicTypeUri + "." + origLang, text)
            .set(topicTypeUri + "." + targetLang, translatedComment)
            .set(LANGUAGE + "#" + ORIGINAL_LANGUAGE, origLang)
        );
    }

    private long workspaceId() {
        return Cookies.get().getLong("dmx_workspace_id");
    }
}
