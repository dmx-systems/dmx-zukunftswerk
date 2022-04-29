package systems.dmx.zukunftswerk;



public class Constants {

    public static final String ZW_PLUGIN_URI      = "systems.dmx.zukunftswerk";
    public static final String TEAM_WORKSPACE_URI = "zukunftswerk.team";

    // Topic Types
    public static final String DOCUMENT           = "zukunftswerk.document";
    public static final String ZW_NOTE            = "zukunftswerk.note";    // "NOTE" is already used by Notes module
    public static final String LABEL              = "zukunftswerk.label";
    public static final String ARROW              = "zukunftswerk.arrow";
    public static final String COMMENT            = "zukunftswerk.comment";
    public static final String COMMENT_DE         = "zukunftswerk.comment.de";
    public static final String COMMENT_FR         = "zukunftswerk.comment.fr";
    public static final String LANGUAGE           = "zukunftswerk.language";
    public static final String TRANSLATION_EDITED = "zukunftswerk.translation_edited";
    public static final String DISPLAY_NAME       = "zukunftswerk.display_name";        // synthetic
    public static final String EDITOR             = "zukunftswerk.editor";
    public static final String EDITOR_FACET       = "zukunftswerk.editor_facet";

    // Assoc Types
    public static final String SHARED_WORKSPACE   = "zukunftswerk.shared_workspace";
    public static final String ATTACHMENT         = "zukunftswerk.attachment";
    public static final String ORIGINAL_LANGUAGE  = "zukunftswerk.original_language";
    public static final String DE                 = "zukunftswerk.de";
    public static final String FR                 = "zukunftswerk.fr";

    // Props (Note)
    public static final String ZW_COLOR           = "zukunftswerk.color";   // Note: COLOR is already used by Webclient,
                                                                            // but as type URI; here we have a prop URI

    // Props (Arrow)
    public static final String X1                 = "zukunftswerk.x1";
    public static final String Y1                 = "zukunftswerk.y1";
    public static final String X2                 = "zukunftswerk.x2";
    public static final String Y2                 = "zukunftswerk.y2";
}
