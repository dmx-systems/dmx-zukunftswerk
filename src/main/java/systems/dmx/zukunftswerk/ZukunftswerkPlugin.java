package systems.dmx.zukunftswerk;

import static systems.dmx.core.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.model.TopicModel;
import systems.dmx.core.osgi.PluginActivator;
import systems.dmx.core.service.Transactional;
import systems.dmx.core.util.DMXUtils;

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
@Consumes("application/json")
@Produces("application/json")
public class ZukunftswerkPlugin extends PluginActivator implements ZukunftswerkService {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    private Logger logger = Logger.getLogger(getClass().getName());

    // -------------------------------------------------------------------------------------------------- Public Methods

    // *** ZukunftswerkService ***

    @GET
    @Path("/discussion/{targetTopicId}")
    @Override
    public List<RelatedTopic> getDiscussion(@PathParam("targetTopicId") long targetTopicId) {
        return DMXUtils.loadChildTopics(
            dmx.getTopic(targetTopicId).getRelatedTopics(COMPOSITION, PARENT, CHILD, COMMENT)
        );
    }

    @POST
    @Path("/comment/{targetTopicId}")
    @Transactional
    @Override
    public Topic addComment(TopicModel comment, @PathParam("targetTopicId") long targetTopicId) {
        try {
            comment.setTypeUri(COMMENT);    // not required to be set by client
            Topic commentTopic = dmx.createTopic(comment);
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
}
