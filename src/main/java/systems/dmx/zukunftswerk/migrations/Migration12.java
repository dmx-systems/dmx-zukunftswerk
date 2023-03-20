package systems.dmx.zukunftswerk.migrations;

import static systems.dmx.core.Constants.*;
import static systems.dmx.files.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.core.service.Migration;



/**
 * Creates "Locked" flag and adds it to "Document"/"Note"/"Textblock"/"Label"/"Arrow".
 * Changes "Arrow" data type "Text" -> "Entity"
 * <p>
 * Part of Zukunftswerk 1.6
 * Runs ALWAYS.
 */
public class Migration12 extends Migration {

    // -------------------------------------------------------------------------------------------------- Public Methods

    @Override
    public void run() {
        // Change "Arrow" data type "Text" -> "Entity"
        dmx.getTopicType(ARROW).setDataTypeUri(ENTITY);
        // Create "Locked" flag
        dmx.createTopicType(mf.newTopicTypeModel(LOCKED, "Locked", BOOLEAN));
        // Add "Locked" flag
        dmx.getTopicType(DOCUMENT).addCompDefBefore(mf.newCompDefModel(DOCUMENT, LOCKED, ONE), FILE + "#" + DE);
        dmx.getTopicType(ZW_NOTE).addCompDef(mf.newCompDefModel(ZW_NOTE, LOCKED, ONE));
        dmx.getTopicType(TEXTBLOCK).addCompDef(mf.newCompDefModel(TEXTBLOCK, LOCKED, ONE));
        dmx.getTopicType(LABEL).addCompDef(mf.newCompDefModel(LABEL, LOCKED, ONE));
        dmx.getTopicType(ARROW).addCompDef(mf.newCompDefModel(ARROW, LOCKED, ONE));
    }
}
