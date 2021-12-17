package systems.dmx.zukunftswerk.migrations;

import static systems.dmx.accesscontrol.Constants.*;
import static systems.dmx.core.Constants.*;
import static systems.dmx.workspaces.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.accesscontrol.AccessControlService;
import systems.dmx.core.service.Inject;
import systems.dmx.core.service.Migration;
import systems.dmx.core.service.accesscontrol.SharingMode;
import systems.dmx.workspaces.WorkspacesService;



/**
 * Extends "Workspace" by 2 more "Workspace Name"s (de+fr).
 * Creates "Community" and "Team" workspaces.
 * <p>
 * Part of Zukunftswerk 1.0.
 * Runs ALWAYS.
 */
public class Migration2 extends Migration {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    @Inject
    private AccessControlService acs;

    @Inject
    private WorkspacesService ws;

    // -------------------------------------------------------------------------------------------------- Public Methods

    @Override
    public void run() {
        //
        // Extend "Workspace" type
        dmx.getTopicType(WORKSPACE)
            .addCompDefBefore(mf.newCompDefModel(DE, false, false, WORKSPACE, WORKSPACE_NAME, ONE), SHARING_MODE)
            .addCompDefBefore(mf.newCompDefModel(FR, false, false, WORKSPACE, WORKSPACE_NAME, ONE), SHARING_MODE);
        //
        // Create "Community" and "Team" workspaces
        acs.setWorkspaceOwner(
            ws.createWorkspace("Community", "zukunftswerk.community", SharingMode.COLLABORATIVE), ADMIN_USERNAME
        );
        acs.setWorkspaceOwner(
            ws.createWorkspace("Team", "zukunftswerk.team", SharingMode.COLLABORATIVE), ADMIN_USERNAME
        );
    }
}
