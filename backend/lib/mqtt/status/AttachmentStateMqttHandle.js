const ComponentType = require("../homeassistant/ComponentType");
const DataType = require("../homie/DataType");
const EntityCategory = require("../homeassistant/EntityCategory");
const HassAnchor = require("../homeassistant/HassAnchor");
const InLineHassComponent = require("../homeassistant/components/InLineHassComponent");
const PropertyMqttHandle = require("../handles/PropertyMqttHandle");
const RobotStateNodeMqttHandle = require("../handles/RobotStateNodeMqttHandle");
const stateAttrs = require("../../entities/state/attributes");

class AttachmentStateMqttHandle extends RobotStateNodeMqttHandle {
    /**
     * @param {object} options
     * @param {import("../handles/RobotMqttHandle")} options.parent
     * @param {import("../MqttController")} options.controller MqttController instance
     * @param {import("../../core/ValetudoRobot")} options.robot
     */
    constructor(options) {
        super(Object.assign(options, {
            topicName: "AttachmentStateAttribute",
            friendlyName: "Attachment state",
            type: "Status"
        }));

        for (const attachment of Object.values(stateAttrs.AttachmentStateAttribute.TYPE)) {
            this.registerChild(new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: attachment,
                friendlyName: ATTACHMENT_FRIENDLY_NAME[attachment] ?? "Unknown",
                datatype: DataType.BOOLEAN,
                getter: async () => {
                    return this.isAttached(attachment);
                },
                helpText: "This handle reports whether the " + ATTACHMENT_FRIENDLY_NAME[attachment].toLowerCase() +
                    " is installed. Attachments not compatible with your robot may be included (but set to `false`)" +
                    " and you can safely ignore them."
            }));
        }

        for (const attachment of Object.values(this.robot.getModelDetails().supportedAttachments)) {
            this.controller.withHass((hass) => {
                this.attachHomeAssistantComponent(
                    new InLineHassComponent({
                        hass: hass,
                        robot: this.robot,
                        name: "AttachmentStateAttribute_" + attachment,
                        friendlyName: ATTACHMENT_FRIENDLY_NAME[attachment] + " attached" ?? "Unknown",
                        componentType: ComponentType.BINARY_SENSOR,
                        baseTopicReference: HassAnchor.getTopicReference(HassAnchor.REFERENCE.HASS_ATTACHMENT_STATE + attachment),
                        autoconf: {
                            state_topic: HassAnchor.getTopicReference(HassAnchor.REFERENCE.HASS_ATTACHMENT_STATE + attachment),
                            icon: ATTACHMENT_ICON[attachment],
                            entity_category: EntityCategory.DIAGNOSTIC,
                            payload_on: "true",
                            payload_off: "false"
                        },
                        topics: {
                            "": HassAnchor.getAnchor(HassAnchor.ANCHOR.ATTACHMENT_STATE + attachment)
                        }
                    })
                );
            });
        }
    }

    /**
     * @private
     * @param {string} attachment
     * @return {boolean}
     */
    isAttached(attachment) {
        const attachmentState = this.robot.state.getFirstMatchingAttribute({
            attributeClass: stateAttrs.AttachmentStateAttribute.name,
            attributeType: attachment
        });

        if (attachmentState === null) {
            return false;
        }

        return attachmentState.attached;
    }

    getInterestingStatusAttributes() {
        return [{attributeClass: stateAttrs.AttachmentStateAttribute.name}];
    }

    async refresh() {
        for (const attachment of Object.values(this.robot.getModelDetails().supportedAttachments)) {
            await HassAnchor.getAnchor(HassAnchor.ANCHOR.ATTACHMENT_STATE + attachment).post(this.isAttached(attachment));
        }

        await super.refresh();
    }
}

const ATTACHMENT_FRIENDLY_NAME = Object.freeze({
    [stateAttrs.AttachmentStateAttribute.TYPE.DUSTBIN]: "Dust bin",
    [stateAttrs.AttachmentStateAttribute.TYPE.WATERTANK]: "Water tank",
    [stateAttrs.AttachmentStateAttribute.TYPE.MOP]: "Mop"
});

const ATTACHMENT_ICON = Object.freeze({
    [stateAttrs.AttachmentStateAttribute.TYPE.DUSTBIN]: "mdi:delete",
    [stateAttrs.AttachmentStateAttribute.TYPE.WATERTANK]: "mdi:water",
    [stateAttrs.AttachmentStateAttribute.TYPE.MOP]: "mdi:paperclip"
});

module.exports = AttachmentStateMqttHandle;
