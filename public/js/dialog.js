function CustomAlert() {
    this.show = function (dialog) {
        var dialogOverlay = document.getElementById('dialog-overlay');
        var dialogBox = document.getElementById('dialog-box');

        dialogOverlay.style.display = "block";
        dialogBox.style.display = "block";

        document.getElementById('dialog-box-head').innerHTML = "Acknowledge This Message";
        document.getElementById('dialog-box-body').innerHTML = dialog;
        document.getElementById('dialog-box-foot').innerHTML = '<button class="btn btn-default btn-primary" onclick="Alert.ok()">OK</button>';
    }
    this.ok = function () {
        this.hide();
    }
    this.hide = function () {
        document.getElementById('dialog-box').style.display = "none";
        document.getElementById('dialog-overlay').style.display = "none";
    }
}

var Alert = new CustomAlert();


function CustomConfirm() {
    this.show = function (_recId, _actionType, _approve) {
        var dialogOverlay = document.getElementById('dialog-overlay');
        var dialogBox = document.getElementById('dialog-box');

        //var navBar = document.getElementById('navbar-collapse-1');
        //navBar.collapse = "hide";

        //$('#navbar-collapse-1').collapse('hide');

        dialogOverlay.style.display = "block";
        dialogBox.style.display = "block";

        document.getElementById('dialog-box-head').innerHTML = "Confirm that action";
        document.getElementById('dialog-box-body').innerHTML = "Do you want to continue?";
        document.getElementById('dialog-box-foot').innerHTML =
            '<button class="btn btn-default btn-primary" onclick="Confirm.yes(\'' + _recId + '\',\'' + _actionType + '\',\'' + _approve + '\')">Yes</button> <button class="btn btn-danger" onclick="Confirm.no()">No</button>';
    }
    this.no = function () {
        this.hide();
    }
    this.yes = function ( _recId, _actionType, _approve) {
              
        this.hide();
        Prompt.show( _recId, _actionType, _approve)
        
    }
    this.hide = function () {
        document.getElementById('dialog-box').style.display = "none";
        document.getElementById('dialog-overlay').style.display = "none";
    }
}

var Confirm = new CustomConfirm();


function CustomPrompt() {
    this.show = function ( _recId, _actionType, _approve) {
        var dialogOverlay = document.getElementById('dialog-overlay');
        var dialogBox = document.getElementById('dialog-box');

        dialogOverlay.style.display = "block";
        dialogBox.style.display = "block";

        document.getElementById('dialog-box-head').innerHTML = "A comment is required";
        document.getElementById('dialog-box-body').innerHTML = "Please enter comment";
        document.getElementById('dialog-box-body').innerHTML += '<br><textarea name="comments" id="prompt_value1" rows="2" cols="20"></textarea>';
        document.getElementById('dialog-box-foot').innerHTML = '<button class="btn btn-default btn-primary" onclick="Prompt.ok(\'' + _recId + '\',\'' + _actionType + '\',\'' + _approve + '\')">OK</button> <button class="btn btn-danger" onclick="Prompt.cancel()">Cancel</button>';
    }
    this.cancel = function () {
        this.hide();
    }
    this.ok = function ( _recId, _actionType, _approve) {
        var prompt_value1 = document.getElementById('prompt_value1').value;
        approvePR(_recId, _actionType, _approve, prompt_value1);
        this.hide();
    }
    this.hide = function () {
        document.getElementById('dialog-box').style.display = "none";
        document.getElementById('dialog-overlay').style.display = "none";
    }
}

var Prompt = new CustomPrompt();

