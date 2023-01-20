package systems.dmx.zukunftswerk.migrations;

import static systems.dmx.zukunftswerk.Constants.*;
import static systems.dmx.core.Constants.*;
import systems.dmx.core.Topic;

import systems.dmx.core.service.Migration;



/**
 * Extends "Document" and "Textblock" by "Comments enabled" flag.
 * <p>
 * Part of Zukunftswerk 1.6
 * Runs ALWAYS.
 */
public class Migration11 extends Migration {

    // -------------------------------------------------------------------------------------------------- Public Methods

    @Override
    public void run() {
        // extend types
        dmx.createTopicType(mf.newTopicTypeModel(COMMENTS_ENABLED, "Comments enabled", BOOLEAN));
        dmx.getTopicType(DOCUMENT).addCompDef(mf.newCompDefModel(DOCUMENT, COMMENTS_ENABLED, ONE));
        dmx.getTopicType(TEXTBLOCK).addCompDef(mf.newCompDefModel(DOCUMENT, COMMENTS_ENABLED, ONE));
        // update instances
        dmx.getTopicsByType(DOCUMENT).stream().forEach(this::setCommentsEnabled);
        dmx.getTopicsByType(TEXTBLOCK).stream().forEach(this::setCommentsEnabled);
    }

    // ------------------------------------------------------------------------------------------------- Private Methods

    private void setCommentsEnabled(Topic topic) {
        topic.update(mf.newChildTopicsModel().set(COMMENTS_ENABLED, true));
    }
}
