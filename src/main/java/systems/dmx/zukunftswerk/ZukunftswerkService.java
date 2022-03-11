package systems.dmx.zukunftswerk;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.util.IdList;

import java.util.List;



public interface ZukunftswerkService {

    /**
     * Retrieves all comments of the current workspace (according to workspace cookie).
     */
    List<Topic> getDiscussion();

    Topic createNote(String note);

    Topic createLabel(String label);

    Topic createComment(String comment, IdList refTopicIds, IdList fileTopicIds);

    // Note: there is no createDocument() call.
    // Documents are created by a generic createTopic() call.

    // Admin

    List<RelatedTopic> getZWWorkspaces();

    Topic createZWWorkspace(String nameDe, String nameFr);
}
