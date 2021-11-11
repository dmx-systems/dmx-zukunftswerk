package systems.dmx.zukunftswerk;

import systems.dmx.core.model.TopicModel;



public interface ZukunftswerkService {

    void addComment(TopicModel comment, long targetTopicId);
}
