package systems.dmx.zukunftswerk;



public class Constants {

    public static final String ZW_PLUGIN_URI            = "systems.dmx.zukunftswerk";
    public static final String TEAM_WORKSPACE_URI       = "zukunftswerk.team";
    public static final String TEAM_WORKSPACE_NAME      = "Team";

    // Topic Types
    public static final String DOCUMENT                 = "zukunftswerk.document";
    public static final String DOCUMENT_NAME            = "zukunftswerk.document_name";
    public static final String ZW_NOTE                  = "zukunftswerk.note"; // "NOTE" is already used by Notes module
    public static final String TEXTBLOCK                = "zukunftswerk.textblock";
    public static final String LABEL                    = "zukunftswerk.label";
    public static final String ARROW                    = "zukunftswerk.arrow";
    public static final String COMMENT                  = "zukunftswerk.comment";
    public static final String COMMENT_DE               = "zukunftswerk.comment.de";
    public static final String COMMENT_FR               = "zukunftswerk.comment.fr";
    public static final String LANGUAGE                 = "zukunftswerk.language";
    public static final String TRANSLATION_EDITED       = "zukunftswerk.translation_edited";
    public static final String VIEWPORT                 = "zukunftswerk.viewport";
    public static final String EDITOR                   = "zukunftswerk.editor";
    public static final String EDITOR_FACET             = "zukunftswerk.editor_facet";
    public static final String SHOW_EMAIL_ADDRESS       = "zukunftswerk.show_email_address";
    public static final String SHOW_EMAIL_ADDRESS_FACET = "zukunftswerk.show_email_address_facet";

    // Assoc Types
    public static final String SHARED_WORKSPACE         = "zukunftswerk.shared_workspace";
    public static final String ATTACHMENT               = "zukunftswerk.attachment";
    public static final String ORIGINAL_LANGUAGE        = "zukunftswerk.original_language";
    public static final String DE                       = "zukunftswerk.de";
    public static final String FR                       = "zukunftswerk.fr";

    // Props (Note, Textblock)
    public static final String ZW_COLOR                 = "zukunftswerk.color"; // Note: COLOR is already used by
                                                          // Webclient module, but as type URI; here we have a prop URI
    // Props (Document, Note, Textblock, Label, Arrow)
    public static final String ANGLE                    = "zukunftswerk.angle";
}
