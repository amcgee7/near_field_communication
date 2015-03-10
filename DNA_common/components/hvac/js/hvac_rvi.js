/*
 * Copyright (c) 2015, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

//Incoming RVI messages to be executed by HVAC
$(document).ready(function(){onDepenancy("rvi.loaded",setup_hvac_service)});

var no_reflect = "";

function setup_hvac_service(){
	console.log("setting up HVAC services.");
	hvacServices = [
		{"name":"hvac/air_circ","callback":"aircirc_rcb"},
		{"name":"hvac/fan","callback":"fan_rcb"},
		{"name":"hvac/fan_speed","callback":"fanspeed_rcb"},
		{"name":"hvac/temp_left","callback":"temp_left_rcb"},
		{"name":"hvac/temp_right","callback":"temp_right_rcb"},
		{"name":"hvac/hazard","callback":"hazard_rcb"},
		{"name":"hvac/seat_heat_right","callback":"seat_heat_right_rcb"},
		{"name":"hvac/seat_heat_left","callback":"seat_heat_left_rcb"},
		{"name":"hvac/airflow_direction","callback":"airflow_direction_rcb"},
		{"name":"hvac/defrost_rear","callback":"defrost_rear_rcb"},
		{"name":"hvac/defrost_front","callback":"defrost_front_rcb"},
	
		{"name":"hvac/subscribe","callback":"hvac_subscribe"}, //handles subscribing and unsubscribing other nodes.
		{"name":"hvac/unsubscribe","callback":"hvac_unsubscribe"} //handles subscribing and unsubscribing other nodes.
	];

	rvi.rviRegisterServices(hvacServices);
	hvacSetupRVIListeners();
}


function aircirc_rcb(args){
	no_reflect = args.sending_node;
	carIndicator.setStatus("airRecirculation", str2bool(args.value));
}

function fan_rcb(args){
	
	console.log("Setting fan status to "+args.value);
	carIndicator.setStatus("fan", str2bool(args.value));
}

function fanspeed_rcb(args){
	
	console.log("Setting fan speed to "+args.value);
	carIndicator.setStatus("fanSpeed", parseInt(args.value));
}

function temp_left_rcb(args){
	
	carIndicator.setStatus("targetTemperatureLeft", parseInt(args.value));
}
function temp_right_rcb(args){
	
	carIndicator.setStatus("targetTemperatureRight", parseInt(args.value));
}
function hazard_rcb(args){
	
	hvacControler.prototype.onHazardChanged(str2bool(args.value));
}
function seat_heat_right_rcb(args){
	no_reflect = args.sending_node;
	carIndicator.setStatus("seatHeaterRight", parseInt(args.value));
}
function seat_heat_left_rcb(args){
	no_reflect = args.sending_node;
	carIndicator.setStatus("seatHeaterLeft", parseInt(args.value));
}
function airflow_direction_rcb(args){
	
	carIndicator.setStatus("airflowDirection", parseInt(args.value));
}
function defrost_rear_rcb(args){
	
	carIndicator.setStatus("rearDefrost", str2bool(args.value));
}
function defrost_front_rcb(args){
	
	carIndicator.setStatus("frontDefrost", str2bool(args.value));
}

//Handles a Subscription request from a node.
function hvac_subscribe(args){
	console.log(args);
	args = JSON.parse(args.value);
	//Add this node to the list of subscribers
	
	if(rvi.settings.subscribers.indexOf(args['node']) == -1){
		rvi.settings.subscribers.push(args['node']);
		rvi.setRviSettings(rvi.settings);
	}
	console.log("Current Subscribers: ");
	console.log(rvi.settings.subscribers);
}

function hvac_unsubscribe(args){
	var node = rvi.settings.subscribers.indexOf(args['node']);
	if(node != -1){
		rvi.settings.subscribers.splice(node,1);	
		rvi.setRviSettings(rvi.settings);
	}
}


function hvacSetupRVIListeners(){
	//Adds RVI listeners for HVAC changes.
	rvi.hvacListener = carIndicator.addListener(
		{
	    onAirRecirculationChanged : function(newValue) {
		//hvacIndicator.onAirRecirculationChanged(newValue);
		sendRVIHVAC("air_circ", newValue);
	    },
	    onFanChanged : function(newValue) {
		//hvacIndicator.onFanChanged(newValue);
	    },
	    onFanSpeedChanged : function(newValue) {
		//hvacIndicator.onFanSpeedChanged(newValue);
		sendRVIHVAC("fan_speed", newValue);
	    },
	    onTargetTemperatureRightChanged : function(newValue) {
		//hvacIndicator.onTargetTemperatureRightChanged(newValue);
		sendRVIHVAC("temp_right", newValue);
	    },
	    onTargetTemperatureLeftChanged : function(newValue) {
		//hvacIndicator.onTargetTemperatureLeftChanged(newValue);
		sendRVIHVAC("temp_left", newValue);
	    },
	    onHazardChanged : function(newValue) {
		console.log("onHazardChanged: "+ newValue);
		sendRVIHVAC("hazard", newValue);
	    },
	    onSeatHeaterRightChanged : function(newValue) {
		//hvacIndicator.onSeatHeaterRightChanged(newValue);
		sendRVIHVAC("seat_heat_right", newValue);
	    },
	    onSeatHeaterLeftChanged : function(newValue) {
		//hvacIndicator.onSeatHeaterLeftChanged(newValue);
		sendRVIHVAC("seat_heat_left", newValue);
	    },
	    onAirflowDirectionChanged : function(newValue) {
		//hvacIndicator.onAirflowDirectionChanged(newValue);
		sendRVIHVAC("airflow_direction", newValue);
	    },
	    onFrontDefrostChanged : function(newValue) {
		//hvacIndicator.onFrontDefrostChanged(newValue);
		sendRVIHVAC("defrost_front", newValue);
	    },
	    onRearDefrostChanged : function(newValue) {
		//hvacIndicator.onRearDefrostChanged(newValue);
		sendRVIHVAC("defrost_rear", newValue);
	    }
	});
	
}

//Sends current values over RVI
function sendCurrentValues(){
	carIndicator.getStatus(function(currentStatus){
		var indicators =[
			"airRecirculation",
			"fanSpeed",
			"frontDefrost",
			"frontLights",
			"hazard",
			"rearDefrost",
			"seatHeaterLeft",
			"seatHeaterRight",
			"targetTemperatureLeft",
			"targetTemperatureRight"
		];

		for(v in indicators){
			if(currentStatus[indicators[v]] != undefined){
				console.log(indicators[v]+" "+currentStatus[indicators[v]]);
			}
		}
	});
}


function sendRVIHVAC(key,value){
	//send message to all subscribers
	//rvi.
	var subs = rvi.settings.subscribers;
	key = "hvac/"+key;
	for(node in subs){

	
	//experimental
		if (no_reflect == subs[node]) {
			console.log();
			no_reflect = "";
			continue;
		};
	/*	
		reflection = no_reflect.indexOf(subs[node]+key+"/"+value);
		if(reflection != -1){
			no_reflect.splice(reflection,1);
			continue;
		}
	*/

		service = subs[node]+key;
		vals = JSON.stringify({value:value.toString()})
		console.log("Sending RVI message Node:"+subs[node])
		console.log("Sending RVI message Key/Val:"+key+"/"+value);

		rvi.comm.send_message(service, 5000, vals, key);
	}
}