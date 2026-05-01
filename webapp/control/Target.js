sap.ui.define([],
	function() {
		"use strict";

		const Target = sap.ui.core.Control.extend("ssg.lk.zintvacations.control.Target", { metadata : {
				properties: {
				  visible:  {type: "boolean", defaultValue: true},
				  target: {type: "int", defaultValue: 0},
				  current: {type: "int", defaultValue: 0},
				  width : {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: ''},
				  pressable: {type: "boolean", defaultValue: false},
				  pressed: {type: "boolean", defaultValue: false},
				},
                events: {
                    press: {},
                },
			}
		});

        Target.M_EVENTS = { press: 'press' };

		Target.prototype._handlePress = function (oEvent) {
            if (this.getPressable()) {
                if (!this.firePress()) {
                    oEvent.preventDefault();
                }

				this.setPressed(!this.getPressed());
            }
        };

		if (sap.ui.Device.support.touch) {
            Target.prototype.ontap = Target.prototype._handlePress;
        } else {
            Target.prototype.onclick = Target.prototype._handlePress;
        }

		jQuery.sap.declare("ssg.lk.zintvacations.control.TargetRenderer");
		jQuery.sap.require("sap.ui.core.Renderer");

		ssg.lk.zintvacations.control.TargetRenderer = {};
		
		Target.prototype.WH = "22px";

		ssg.lk.zintvacations.control.TargetRenderer.render = function(rm, oControl) {
			if (!oControl.getVisible()) {
				return;
			}
			
			const props = {
				borderColor: oControl.getCurrent() < oControl.getTarget() ? "#CC3333" : "#999"
			};
			
			rm.write('<table');
			rm.writeControlData(oControl);
			rm.writeClasses();
			if (oControl.getWidth()) {
				rm.addStyle("width", oControl.getWidth());
			}
			rm.addStyle("font-size", "12px");
			rm.writeStyles();
			rm.write('>');
			rm.write('<tr>');
			
			rm.write('<td');
			rm.addStyle("text-align", "right");
			rm.writeStyles();
			rm.write('>');
			
			rm.write('<div');
			rm.addStyle("cursor", "pointer");
			rm.addStyle("display", "inline-block");
			rm.addStyle("text-align", "center");
			rm.addStyle("width", oControl.WH);
			rm.addStyle("height", oControl.WH);
			rm.addStyle("border", "1px solid " + props.borderColor);
			rm.addStyle("border-radius", oControl.WH);
			rm.addStyle("color", "#FFF");
			rm.addStyle("background-color", props.borderColor);
			rm.addStyle("padding-top", "3px");
			rm.addStyle("box-sizing", "border-box");
			rm.writeStyles();
			rm.write('>');
			rm.write(oControl.getTarget());
			rm.write('</div>');
			
			rm.write('</td>');
			
			rm.write('<td>');
			
			rm.write('<div');
			rm.addStyle("cursor", "pointer");
			rm.addStyle("display", "inline-block");
			rm.addStyle("text-align", "center");
			rm.addStyle("width", oControl.WH);
			rm.addStyle("height", oControl.WH);
			rm.addStyle("border", "1px solid " + props.borderColor);
			rm.addStyle("border-radius", oControl.WH);
			rm.addStyle("color", "#999");
			rm.addStyle("background-color", "#FFF");
			rm.addStyle("padding-top", "3px");
			rm.addStyle("box-sizing", "border-box");
			rm.writeStyles();
			rm.write('>');
			rm.write(oControl.getCurrent());
			rm.write('</div>');
			
			rm.write('</td></tr>');
			rm.write('</table>');
			
		};

		return Target;

}, true);