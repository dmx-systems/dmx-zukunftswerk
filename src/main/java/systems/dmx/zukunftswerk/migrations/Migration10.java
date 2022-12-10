package systems.dmx.zukunftswerk.migrations;

import static systems.dmx.core.Constants.*;
import static systems.dmx.files.Constants.*;
import static systems.dmx.webclient.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.core.service.Migration;



/**
 * Extends topic type "Comment" by "Textblock".
 * <p>
 * Part of Zukunftswerk 1.6
 * Runs ALWAYS.
 */
public class Migration10 extends Migration {

    // -------------------------------------------------------------------------------------------------- Public Methods

    @Override
    public void run() {
        dmx.getTopicType(COMMENT).addCompDefBefore(
            mf.newCompDefModel(
                COMMENT, TEXTBLOCK, ONE,
                mf.newViewConfigModel().addConfigTopic(mf.newTopicModel(VIEW_CONFIG))
                // FIXME: view config topic has empty label (instead "View Configuration")
            ),
            FILE + "#" + ATTACHMENT
        );
    }
}
