package systems.dmx.zukunftswerk.migrations;

import static systems.dmx.zukunftswerk.Constants.*;
import static systems.dmx.core.Constants.*;
import static systems.dmx.workspaces.Constants.*;

import systems.dmx.core.service.Migration;



/**
 * Adds 2 more "Workspace Name" (de+fr) to "Workspace".
 * <p>
 * Part of Zukunftswerk 1.0.
 * Runs ALWAYS.
 */
public class Migration2 extends Migration {

    @Override
    public void run() {
        dmx.getTopicType(WORKSPACE)
            .addCompDefBefore(mf.newCompDefModel(DE, false, false, WORKSPACE, WORKSPACE_NAME, ONE), SHARING_MODE)
            .addCompDefBefore(mf.newCompDefModel(FR, false, false, WORKSPACE, WORKSPACE_NAME, ONE), SHARING_MODE);
    }
}
