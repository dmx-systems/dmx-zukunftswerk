package systems.dmx.zukunftswerk.migrations;

import static systems.dmx.core.Constants.*;
import static systems.dmx.files.Constants.*;
import static systems.dmx.webclient.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.core.model.ViewConfigModel;
import systems.dmx.core.service.Migration;



/**
 * Adds "Translation Edited" flag to "Document"/"Note"/"Textblock"/"Label".
 * <p>
 * Part of Zukunftswerk 1.6
 * Runs ALWAYS.
 */
public class Migration11 extends Migration {

    // -------------------------------------------------------------------------------------------------- Public Methods

    @Override
    public void run() {
        ViewConfigModel config = mf.newViewConfigModel().addConfigTopic(mf.newTopicModel(VIEW_CONFIG));
        // Note: view config model can be reused. Individual topics will be created.
        // FIXME: view config topic has empty label (instead "View Configuration")
        //
        dmx.getTopicType(DOCUMENT).addCompDefBefore(mf.newCompDefModel(DOCUMENT, TRANSLATION_EDITED, ONE, config),
            FILE + "#" + DE
        );
        dmx.getTopicType(ZW_NOTE).addCompDef(mf.newCompDefModel(ZW_NOTE, TRANSLATION_EDITED, ONE, config));
        dmx.getTopicType(TEXTBLOCK).addCompDef(mf.newCompDefModel(TEXTBLOCK, TRANSLATION_EDITED, ONE, config));
        dmx.getTopicType(LABEL).addCompDef(mf.newCompDefModel(LABEL, TRANSLATION_EDITED, ONE, config));
    }
}
