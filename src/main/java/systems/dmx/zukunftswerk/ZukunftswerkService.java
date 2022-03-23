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

    Topic createComment(String comment, IdList refTopicIds, IdList fileTopicIds);

    // Note: there are no createDocument() or createArrow() calls here.
    // Documents and arrows are created by generic createTopic() calls.
    // No auto-translation is involved.

    // Admin

    /**
     * Retrieves all ZW shared workspaces.
     */
    List<RelatedTopic> getAllZWWorkspaces();

    /**
     * Retrieves the ZW shared workspaces of the current user plus the "Team" workspace, if the
     * current user is a Team member.
     */
    List<RelatedTopic> getZWWorkspacesOfUser(String username);

    List<Topic> getAllUsers();

    Topic createZWWorkspace(String nameDe, String nameFr);
}
