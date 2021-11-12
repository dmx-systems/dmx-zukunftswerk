package systems.dmx.zukunftswerk;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.model.TopicModel;

import java.util.List;



public interface ZukunftswerkService {

    List<RelatedTopic> getDiscussion(long targetTopicId);

    Topic addComment(TopicModel comment, long targetTopicId);
}
