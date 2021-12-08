package systems.dmx.zukunftswerk;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;

import java.util.List;



public interface ZukunftswerkService {

    List<RelatedTopic> getDiscussion(long workspaceId);

    Topic createNote(String note);

    Topic createLabel(String label);

    Topic createComment(String comment, long workspaceId, long refTopicId);
}
