package systems.dmx.zukunftswerk;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.util.IdList;

import java.util.List;



public interface ZukunftswerkService {

    /**
     * Retrieves the ZW shared workspaces of the current user.
     */
    List<RelatedTopic> getZWWorkspaces();

    /**
     * Retrieves the comments of the current workspace (according to workspace cookie).
     */
    List<Topic> getDiscussion();

    Topic createNote(String note);

    Topic createLabel(String label);

    Topic createComment           (String comment, IdList refTopicIds, IdList fileTopicIds);
    Topic createMonolingualComment(String comment, IdList refTopicIds, IdList fileTopicIds);

    // Note: there are no createDocument() or createArrow() calls here.
    // Documents and arrows are created by generic createTopic() calls.
    // No auto-translation is involved.

    List<Topic> getAllUsers();

    // --- Admin ---

    /**
     * Retrieves all ZW shared workspaces.
     */
    List<RelatedTopic> getAllZWWorkspaces();

    /**
     * Retrieves the ZW shared workspaces of the given user plus the "Team" workspace, if the
     * given user is a Team member.
     */
    List<RelatedTopic> getZWWorkspacesOfUser(String username);

    Topic createZWWorkspace(String nameDe, String nameFr);
}
