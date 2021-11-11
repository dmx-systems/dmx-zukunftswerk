package systems.dmx.zukunftswerk;

import static systems.dmx.core.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.core.Topic;
import systems.dmx.core.model.TopicModel;
import systems.dmx.core.osgi.PluginActivator;
import systems.dmx.core.service.Transactional;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.Produces;
import javax.ws.rs.Consumes;

import java.util.logging.Logger;



@Path("/zukunftswerk")
@Consumes("application/json")
@Produces("application/json")
public class ZukunftswerkPlugin extends PluginActivator implements ZukunftswerkService {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    private Logger logger = Logger.getLogger(getClass().getName());

    // -------------------------------------------------------------------------------------------------- Public Methods

    // *** ZukunftswerkService ***

    @POST
    @Path("/comment/{targetTopicId}")
    @Transactional
    @Override
    public void addComment(TopicModel comment, @PathParam("targetTopicId") long targetTopicId) {
        try {
            comment.setTypeUri(COMMENT);    // not required to be set by client
            Topic commentTopic = dmx.createTopic(comment);
            dmx.createAssoc(mf.newAssocModel(
                COMPOSITION,
                mf.newTopicPlayerModel(targetTopicId, PARENT),
                mf.newTopicPlayerModel(commentTopic.getId(), CHILD)
            ));
        } catch (Exception e) {
            throw new RuntimeException("Adding comment to topic " + targetTopicId + " failed, comment=" + comment, e);
        }
    }
}
