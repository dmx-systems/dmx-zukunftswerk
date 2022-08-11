package systems.dmx.zukunftswerk;

import static systems.dmx.accesscontrol.Constants.*;
import static systems.dmx.timestamps.Constants.*;
import static systems.dmx.zukunftswerk.Constants.*;

import systems.dmx.accesscontrol.AccessControlService;
import systems.dmx.core.RelatedTopic;
import systems.dmx.core.Topic;
import systems.dmx.core.service.CoreService;
import systems.dmx.sendmail.SendmailService;
import systems.dmx.timestamps.TimestampsService;
import systems.dmx.workspaces.WorkspacesService;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;



class EmailDigests {

    // ------------------------------------------------------------------------------------------------------- Constants

    static final long MILLISECS_PER_DAY = 1000 * 60 * 60 * 24;

    // ---------------------------------------------------------------------------------------------- Instance Variables

    private CoreService dmx;
    private AccessControlService acs;
    private WorkspacesService ws;
    private TimestampsService timestamps;
    private SendmailService sendmail;

    private Topic teamWorkspace;
    private int digestCount;        // manipulated from lambda, so we make it a field (instead a local variable)

    private Logger logger = Logger.getLogger(getClass().getName());

    // ---------------------------------------------------------------------------------------------------- Constructors

    EmailDigests(CoreService dmx, AccessControlService acs, WorkspacesService ws, TimestampsService timestamps,
                 SendmailService sendmail, Topic teamWorkspace) {
        this.dmx = dmx;
        this.acs = acs;
        this.ws = ws;
        this.timestamps = timestamps;
        this.sendmail = sendmail;
        this.teamWorkspace = teamWorkspace;
    }

    // ----------------------------------------------------------------------------------------- Package Private Methods

    // Digests are emailed every morning at 6am.
    // Note: if the ZW plugin is deployed after 6am, the first digests are sent right away.
    void startTimedTask() {
        Calendar cal = new GregorianCalendar();
        cal.set(Calendar.HOUR_OF_DAY, 6);    // 6am
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        logger.info("### Sheduling email-digests task for daily execution at 6am, first execution: " + cal.getTime());
        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                sendEmailDigests();
            }
        }, cal.getTime(), MILLISECS_PER_DAY);
    }

    // ------------------------------------------------------------------------------------------------- Private Methods

    private void sendEmailDigests() {
        try {
            long to = System.currentTimeMillis();
            digestCount = 0;
            timestamps.getTopicsByModificationTime(to - MILLISECS_PER_DAY, to).stream()
                .filter(this::isComment)
                .collect(Collectors.groupingBy(this::workspace))
                .forEach((workspaceId, comments) -> {
                    String workspace = dmx.getTopic(workspaceId).getSimpleValue().toString();
                    String subject = "[ZW Platform] " + workspace;
                    StringBuilder message = new StringBuilder();
                    logger.info("### Sending email digest for workspace \"" + workspace + "\" (" + comments.size() +
                        " comments)");
                    comments.forEach(comment -> {
                        timestamps.enrichWithTimestamps(comment);
                        acs.enrichWithUserInfo(comment);
                    });
                    comments.sort((c1, c2) -> {
                        long d = c1.getModel().getChildTopics().getLong(MODIFIED)       // synthetic, so operate on model
                               - c2.getModel().getChildTopics().getLong(MODIFIED);      // synthetic, so operate on model
                        return d < 0 ? -1 : d == 0 ? 0 : 1;
                    });
                    comments.forEach(comment -> {
                        message.append(emailMessage(comment));
                    });
                    forEachTeamMember(username -> {
                        sendmail.doEmailRecipient(subject, message.toString(), username);
                    });
                    digestCount++;
                });
            if (digestCount == 0) {
                logger.info("### Sending email digests SKIPPED -- no new/changed comment in last 24 hours");
            }
        } catch (Exception e) {
            throw new RuntimeException("Sending email digests failed", e);
        }
    }

    private boolean isComment(Topic topic) {
        return topic.getTypeUri().equals(COMMENT);
    }

    private Long workspace(Topic comment) {
        return ws.getAssignedWorkspace(comment.getId()).getId();
    }

    private String emailMessage(Topic comment) {
        String commentDe = comment.getChildTopics().getString(COMMENT_DE);
        String commentFr = comment.getChildTopics().getString(COMMENT_FR, "");
        String creator   = comment.getModel().getChildTopics().getString(CREATOR);     // synthetic, so operate on model
        long modified    = comment.getModel().getChildTopics().getLong(MODIFIED);      // synthetic, so operate on model
        return "<br>\rAuthor: " + creator + "<br>\rDate: " + new Date(modified) + "<br><br>\r\r" +
            commentDe + "\r>>>\r" + commentFr + "\r\r------------------------------------------------<br>\r";
    }

    private void forEachTeamMember(Consumer<String> consumer) {
        getZWTeamMembers().stream().forEach(username -> {
            consumer.accept(username.getSimpleValue().toString());
        });
    }

    // TODO: copied from ZukunftswerkPlugin.java
    private List<RelatedTopic> getZWTeamMembers() {
        return acs.getMemberships(teamWorkspace.getId());
    }
}
