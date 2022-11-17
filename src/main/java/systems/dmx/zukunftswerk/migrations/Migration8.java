package systems.dmx.zukunftswerk.migrations;

import static systems.dmx.core.Constants.*;
import static systems.dmx.files.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.core.service.Migration;



/**
 * Extends topic type "Document" by "Original Language".
 * Note: before ZW 1.5 Document(Name)s were not auto-translated.
 * <p>
 * Part of Zukunftswerk 1.5
 * Runs ALWAYS.
 */
public class Migration8 extends Migration {

    // -------------------------------------------------------------------------------------------------- Public Methods

    @Override
    public void run() {
        dmx.getTopicType(DOCUMENT).addCompDefBefore(
            mf.newCompDefModel(ORIGINAL_LANGUAGE, false, false, DOCUMENT, LANGUAGE, ONE),
            FILE + "#" + DE
        );
        // FIXME: add view config to comp def
    }
}
