package systems.dmx.zukunftswerk;

import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.util.IdList;

import java.util.List;



public interface ZukunftswerkService {

    /**
     * Returns the ZW shared workspaces of the current user.
     *
     * @return  the workspaces as a list of RelatedTopics. Their "relating associations" are the Memberships.
     *          Note: the "Team" workspace is not included.
     */
    List<RelatedTopic> getZWWorkspaces();

    /**
     * Returns the comments of the current workspace (according to workspace cookie).
     */
    List<Topic> getDiscussion();

    Topic createNote(String note);

    Topic createLabel(String label);

    Topic createComment           (String comment, IdList refTopicIds, IdList fileTopicIds);
    Topic createMonolingualComment(String comment, IdList refTopicIds, IdList fileTopicIds);

    // Note: there are no createDocument() or createArrow() calls here.
    // Documents and arrows are created by generic createTopic() calls.
    // No auto-translation is involved.

    /**
     * Needed by migration 4.
     */
    Topic createViewport(long workspaceId);

    List<Topic> getAllUsers();

    // --- Admin ---

    /**
     * Returns all ZW shared workspaces.
     */
    List<RelatedTopic> getAllZWWorkspaces();

    /**
     * Returns the ZW shared workspaces of the given user plus the "Team" workspace, if the
     * given user is a "Team" member.
     */
    List<RelatedTopic> getZWWorkspacesOfUser(String username);

    /**
     * Returns all ZW "Team" members.
     *
     * @return    list of Username topics.
     */
    List<RelatedTopic> getZWTeamMembers();

    List<RelatedTopic> bulkUpdateWorkspaceMemberships(long workspaceId, IdList addUserIds1, IdList removeUserIds1,
                                                                        IdList addUserIds2, IdList removeUserIds2);
    List<RelatedTopic> bulkUpdateUserMemberships(String username, IdList addWorkspaceIds1, IdList removeWorkspaceIds1,
                                                                  IdList addWorkspaceIds2, IdList removeWorkspaceIds2);

    Topic createZWWorkspace(String nameDe, String nameFr);
}
