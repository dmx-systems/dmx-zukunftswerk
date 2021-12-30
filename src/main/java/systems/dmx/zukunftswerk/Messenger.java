package systems.dmx.zukunftswerk;

import systems.dmx.core.Topic;
import systems.dmx.core.service.websocket.WebSocketService;

import org.codehaus.jettison.json.JSONObject;

import java.util.logging.Level;
import java.util.logging.Logger;



class Messenger {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    private WebSocketService wss;

    private Logger logger = Logger.getLogger(getClass().getName());

    // ---------------------------------------------------------------------------------------------------- Constructors

    Messenger(WebSocketService wss) {
        this.wss = wss;
    }

    // ----------------------------------------------------------------------------------------- Package Private Methods

    /* TODO
    void addTopicToTopicmap(long topicmapId, ViewTopic topic) {
        try {
            sendToReadAllowed(new JSONObject()
                .put("type", "addTopicToTopicmap")
                .put("args", new JSONObject()
                    .put("topicmapId", topicmapId)
                    .put("viewTopic", topic.toJSON())
                ), topic.getId()
            );
        } catch (Exception e) {
            logger.log(Level.WARNING, "Error while sending a \"addTopicToTopicmap\" message:", e);
        }
    } */

    // ------------------------------------------------------------------------------------------------- Private Methods

    private void sendToAllButOrigin(JSONObject message) {
        wss.sendToAllButOrigin(message.toString());
    }

    private void sendToReadAllowed(JSONObject message, long objectId) {
        wss.sendToReadAllowed(message.toString(), objectId);
    }
}
