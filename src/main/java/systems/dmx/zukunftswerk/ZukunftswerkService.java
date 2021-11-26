package systems.dmx.zukunftswerk;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;

import java.util.List;



public interface ZukunftswerkService {

    List<RelatedTopic> getDiscussion(long targetTopicId);

    Topic createNote(String note);

    Topic createComment(String comment, long targetTopicId);
}
