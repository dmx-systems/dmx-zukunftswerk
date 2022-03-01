package systems.dmx.zukunftswerk;

import systems.dmx.core.Topic;
import systems.dmx.core.util.IdList;

import java.util.List;



public interface ZukunftswerkService {

    List<Topic> getDiscussion();

    // Note: there is no createDocument() call.
    // Documents are created by a generic createTopic() call.

    Topic createNote(String note);

    Topic createLabel(String label);

    Topic createComment(String comment, IdList refTopicIds, IdList fileTopicIds);
}
