package systems.dmx.zukunftswerk;

import static systems.dmx.core.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.model.TopicModel;
import systems.dmx.core.osgi.PluginActivator;
import systems.dmx.core.service.DirectivesResponse;
import systems.dmx.core.service.Inject;
import systems.dmx.core.service.Transactional;
import systems.dmx.core.util.DMXUtils;
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
    @Path("/discussion/{targetTopicId}")
    @Override
    public List<RelatedTopic> getDiscussion(@PathParam("targetTopicId") long targetTopicId) {
        return DMXUtils.loadChildTopics(
            dmx.getTopic(targetTopicId).getRelatedTopics(COMPOSITION, PARENT, CHILD, COMMENT)
        );
    }

    @POST
    @Path("/note")
    @Consumes("text/plain")
    @Transactional
    @Override
    public DirectivesResponse createNote(String note) {
        try {
            return new DirectivesResponse(createBilingualTopic(NOTE, note));
        } catch (Exception e) {
            throw new RuntimeException("Creating note failed, text=" + note, e);
        }
    }

    @POST
    @Path("/comment/{targetTopicId}")
    @Consumes("text/plain")
    @Transactional
    @Override
    public Topic addComment(String comment, @PathParam("targetTopicId") long targetTopicId) {
        try {
            Topic commentTopic = createBilingualTopic(COMMENT, comment);
            dmx.createAssoc(mf.newAssocModel(
                COMPOSITION,
                mf.newTopicPlayerModel(targetTopicId, PARENT),
                mf.newTopicPlayerModel(commentTopic.getId(), CHILD)
            ));
            return commentTopic;
        } catch (Exception e) {
            throw new RuntimeException("Adding comment to topic " + targetTopicId + " failed, comment=" + comment, e);
        }
    }

    // ------------------------------------------------------------------------------------------------- Private Methods

    private Topic createBilingualTopic(String topicTypeUri, String text) {
        // EN acts as dummy language, not used in this application.
        // This translation's sole purpose is detection of the comment's original language
        Translation translation = deepls.translate(text, "EN").get(0);
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
        return dmx.createTopic(mf.newTopicModel(topicTypeUri, mf.newChildTopicsModel()
            .set(topicTypeUri + "." + origLang, text)
            .set(topicTypeUri + "." + targetLang, translatedComment)
            .set("zukunftswerk.language#zukunftswerk.original_language", origLang)
        ));
    }
}
