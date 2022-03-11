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

    // Note: there are no createDocument() or createArrow() calls here.
    // Documents and arrows are created by generic createTopic() calls.
    // For documents and arrows no auto-translation is involved.

    // Admin

    List<RelatedTopic> getZWWorkspaces();

    List<Topic> getUsers();

    Topic createZWWorkspace(String nameDe, String nameFr);
}
