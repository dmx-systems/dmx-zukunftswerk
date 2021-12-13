package systems.dmx.zukunftswerk;

import static systems.dmx.core.Constants.*;
import static systems.dmx.files.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.model.TopicModel;
import systems.dmx.core.osgi.PluginActivator;
import systems.dmx.core.service.Inject;
import systems.dmx.core.service.Transactional;
import systems.dmx.core.util.DMXUtils;
import systems.dmx.core.util.IdList;
import systems.dmx.deepl.DeepLService;
import systems.dmx.deepl.Translation;

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
public class ZukunftswerkPlugin extends PluginActivator implements ZukunftswerkService {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    @Inject
    private DeepLService deepls;

    private Logger logger = Logger.getLogger(getClass().getName());

    // -------------------------------------------------------------------------------------------------- Public Methods

    // ZukunftswerkService

    @GET
    @Path("/discussion/{workspaceId}")
    @Override
    public List<RelatedTopic> getDiscussion(@PathParam("workspaceId") long workspaceId) {
        return DMXUtils.loadChildTopics(
            dmx.getTopic(workspaceId).getRelatedTopics(COMPOSITION, PARENT, CHILD, COMMENT)
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
    @Path("/comment/{workspaceId}")
    @Consumes("text/plain")
    @Transactional
    @Override
    public Topic createComment(String comment, @PathParam("workspaceId") long workspaceId,
                                               @QueryParam("refTopicId") long refTopicId,
                                               @QueryParam("fileTopicIds") IdList fileTopicIds) {
        try {
            TopicModel commentModel = createBilingualTopicModel(COMMENT, comment);
            // add comment/document ref
            if (refTopicId != 0) {
                String refTypeUri = dmx.getTopic(refTopicId).getTypeUri();
                commentModel.getChildTopics().setRef(refTypeUri, refTopicId);
            }
            if (fileTopicIds != null) {
                for (long fileTopicId : fileTopicIds) {
                    commentModel.getChildTopics().addRef(FILE + "#" + ATTACHMENT, fileTopicId);
                }
            }
            //
            Topic commentTopic = dmx.createTopic(commentModel);
            // associate comment to workspace
            dmx.createAssoc(mf.newAssocModel(
                COMPOSITION,
                mf.newTopicPlayerModel(workspaceId, PARENT),
                mf.newTopicPlayerModel(commentTopic.getId(), CHILD)
            ));
            return commentTopic;
        } catch (Exception e) {
            throw new RuntimeException("Creating comment failed, comment=\"" + comment + "\", workspaceId=" +
                workspaceId + ", refTopicId=" + refTopicId + ", fileTopicIds=" + fileTopicIds, e);
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
}
