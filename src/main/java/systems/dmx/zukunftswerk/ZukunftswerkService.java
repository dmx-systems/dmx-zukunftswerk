package systems.dmx.zukunftswerk;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.service.DirectivesResponse;

import java.util.List;



public interface ZukunftswerkService {

    List<RelatedTopic> getDiscussion(long targetTopicId);

    DirectivesResponse createNote(String note);

    Topic addComment(String comment, long targetTopicId);
}
