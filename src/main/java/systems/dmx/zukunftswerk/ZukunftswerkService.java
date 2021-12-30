package systems.dmx.zukunftswerk;

import systems.dmx.core.Topic;
import systems.dmx.core.util.IdList;

import java.util.List;



public interface ZukunftswerkService {

    List<Topic> getDiscussion();

    Topic createNote(String note);

    Topic createLabel(String label);

    Topic createComment(String comment, long refTopicId, IdList fileTopicIds);
}
