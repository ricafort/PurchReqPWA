(function(document) {

    'use strict';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./sw.js')
            .then(function() { console.log('Registered service worker!'); });
    }
    
    var accessToken = localStorage.getItem("accessToken");
    var userName = localStorage.getItem("userName");
    if (accessToken) {
        $("#btnLogin").hide();
        $("#btnLogout").show();
        $("#twoFactor").hide();
        document.getElementById('user').innerHTML = 'Welcome ' + userName;

        // Send an AJAX request
        getUserInfo();
        findbyProjManager();
        findbyProjManagerCompleted();
    }
    else {       
        $("#btnLogin").hide();
        $("#btnLogout").hide();
        $("#twoFactor").show();
    }

    $("#divLogin").hide();

})(document);   

//var baseUrl = 'http://localhost/PRWebAPI/';
var baseUrl = 'http://localhost:58537/';
//var baseUrl = 'http://localhost:58536/';

var uriU = baseUrl + 'api/userInfo';
var uriH = baseUrl + 'api/purchReqHeadersProjManager';
var uriHC = baseUrl + 'api/purchReqHeadersProjManagerCompleted';
var uriW = baseUrl + 'api/workflowWorkItemProjManagerPR';
var uriL = baseUrl + 'api/purchReqLinesPR';

var uriA = baseUrl + 'api/approvePRRecId';

var uriPR = baseUrl + 'api/purchReqHeadersPRId';


var showResponse = function (object) {
    $("#preOutput").text(JSON.stringify(object, null, 4));
};


window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');

function getPhoneNumberFromUserInput()
{

    var phoneNumber = $('#mobileNumber').val();

    console.log(phoneNumber);

    var appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
            window.confirmationResult = confirmationResult;
            $("#recaptcha-container").show();
            //Alert.show('captcha successfull'); turn into inline html
            document.getElementById('results').innerHTML = 'Captcha is successful!. Check your phone and verify with code';
            $("#recaptcha-container").hide();
    });
}

    
    var twoFactor = function () {
        window.confirmationResult.confirm(document.getElementById("verificationCode").value)
        .then(function (result) {
            //Alert.show('login process successfull!\n login'); turn into inline html
            document.getElementById('results').innerHTML = 'Verification process successful!. Please sign in';
            $("#divLogin").show();
            $("#btnLogin").show();
        }, function (error) {
            $('#navbar-collapse-1').collapse('hide');
            Alert.show(error);
        });
    };


    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

var login = function () {
    
    //twoFactor();
    var url = baseUrl + "token";
    var data = $("#divLogin").serialize();
    data += "&grant_type=password";
    $.post(url, data)
        .done(saveAccessToken)
     .fail(function (jqXHR, textStatus, err) {
         $('#navbar-collapse-1').collapse('hide');
         Alert.show('Error: ' + err);
     });
    
    $("#twoFactor").hide();
    
    return false;
}

var logout = function () {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    //$("#btnLogin").show();
    $("#btnLogout").hide();
    $("#divLogin").hide();
    $("#twoFactor").show();
    document.getElementById('user').innerHTML = '';
    document.getElementById('results').innerHTML = 'This implements 2 Factor Security. Please send your mobile number, then tick captcha to receive verification code, verify using the code and then sign in';
    location.reload();
   
}

var saveAccessToken = function (data) {
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("userName", $('#username').val());
    $("#btnLogin").hide();
    $("#divLogin").hide();
    $("#btnLogout").show();
    $('#navbar-collapse-1').collapse('hide');
    document.getElementById('user').innerHTML = 'Welcome ' + $('#username').val();
    Alert.show('Sign in Succesful. Welcome ' + $('#username').val());
    getUserInfo();
 
}

function getHeaders() {
    var accessToken = localStorage.getItem("accessToken");    
    if (accessToken) {
        return { "Authorization": "Bearer " + accessToken };
    } else {
        $('#navbar-collapse-1').collapse('hide');
        Alert.show('You need to log in');
    }
}

$("#btnLogin").click(login);
$("#btnLogout").click(logout);


function formatItemH(itemH) {
    return 'Purch id:<strong>' + itemH.PurchReqId + '</strong>, ' + 'Purch name:<strong>' + itemH.Name + '</strong><br>'
        + 'Proj manager:<strong>' + itemH.ProjManager + '</strong>, ' + 'Created date:<strong>' + itemH.CreatedDateTime + '</strong>';
}

function formatItemW(itemW) {
    return itemW.UserId + ', ' + itemW.Subject;
}


function formatItemL(itemL) {
    return itemL.LineNum + ', ' + itemL.ItemId + ', ' + itemL.ItemName + ', ' + itemL.ItemDescription + ', ' + itemL.PurchQty + ', ' + itemL.PurchPrice;
}



function getUserInfo() {
    $('#prHeader').empty();
    var _company = $('#_company').val();
    var userName = localStorage.getItem("userName");    
    if ($('#_projManager').val()) {
        var _projManager = $('#_projManager').val();
    }
    else {
        var _projManager = userName;
    }
    var url = uriU + '?' + '_projManager=' + _projManager;
    $.ajax(url, {
        type: "GET",
        headers: getHeaders()
    })
      .done(function (data) {
          $('#_company').val(data.Company);
          $('#_projManager').val(data.Id);
          $('#prHeader').empty();
          $('#prHeader').append('<div class="jumbotron">' + '<h5>' + "Purchase Requisitions In Review for " + data.Name + '</h5>' + '</div>');
      })
      .fail(function (jqXHR, textStatus, err) {
          $('#navbar-collapse-1').collapse('hide');
          Alert.show('Error: ' + err);
      });
}



async function getWorkflowItemProjManagerPR(_prId, newId) {
    // Send an AJAX request
    var _company = $('#_company').val();
    var _projManager = $('#_projManager').val();
    var _comment = $('#approveComment').val();
    var status1 = "This workflow is deligated to another user";
    var status3 = "An error occured to this workflow item. Please check with AX Support";
    var url = uriW + '?' + '_company=' + _company + '&' + '_projManager=' + _projManager + '&' + '_prId=' + _prId;
    $.ajax(url, {
        type: "GET",
        headers: getHeaders()
    })
        .done(function (data) {
            // On success, 'data' contains a list of PRs.
            if (data.Status == 0) {
                $('#' + newId).append('<li class = "list-group-item">' + '<strong>' + formatItemW(data) + '</strong>' + '<div>'
                    + '<button class="btn btn-success btn-block" onclick= "confirmShow(' + data.RecId + ',1,true)">Approve</button>' //approve
                    + '<button class="btn btn-danger btn-block" onclick= "confirmShow(' + data.RecId + ',6,true)">Reject</button>' //reject
                    + '<button class="btn btn-info btn-block" onclick= "confirmShow(' + data.RecId + ',3,true)">Request change</button>' //request change
                    + '</div>' + '</li>' + '</div>')
            }
            else if (data.Status == 1){
                $('#' + newId).append('<li class = "list-group-item">' + '<strong>' + status1 + '</strong>' + '<div>'
                    + '</div>' + '</li>' + '</div>')
            }
            else if (data.Status == 3){
                $('#' + newId).append('<li class = "list-group-item">' + '<strong>' + status3 + '</strong>' + '<div>'
                    + '</div>' + '</li>' + '</div>')
            }
            else{
                $('#' + newId).append('<li class = "list-group-item">' + '<strong>' + formatItemW(data) + " " + status1 + ' or ' + status3 + '</strong>' + '<div>'
                        + '</div>' + '</li>' + '</div>')
            }
        })
      .fail(function (jqXHR, textStatus, err) {
          $('#navbar-collapse-1').collapse('hide');
          Alert.show('Error: ' + err);
      });
}

function confirmShow(_recId, _actionType, _approve) {
    $('#navbar-collapse-1').collapse('hide');
    Confirm.show(_recId, _actionType, _approve)
}


function purchReqLinesPR(_prTableRecId, newId) {
    // Send an AJAX request
    var _company = $('#_company').val();
    var url = uriL + '?' + '_company=' + _company + '&' + '_prTableRecId=' + _prTableRecId;
    $.ajax(url, {
        type: "GET",
        headers: getHeaders()
    })
        .done(function (data) {
            // On success, 'data' contains a list of PRs.
            $.each(data, function (key, itemL) {
                // Add a list item for the PR.
            $('<li>', { text: formatItemL(itemL) }).appendTo($('#' + newId)).attr("class", "list-group-item");
            });
        })
    .fail(function (jqXHR, textStatus, err) {
        $('#navbar-collapse-1').collapse('hide');
        Alert.show('Error: ' + err);
    });
}

function purchReqLinesPRCompleted(_prTableRecId, newId) {    
    // Send an AJAX request
    var _company = $('#_company').val();
    var url = uriL + '?' + '_company=' + _company + '&' + '_prTableRecId=' + _prTableRecId;
    $.ajax(url, {
        type: "GET",
        headers: getHeaders()
    })
        .done(function (data) {
            // On success, 'data' contains a list of PRs.
            $.each(data, function (key, itemL) {
                // Add a list item for the PR.
                $('<li>', { text: formatItemL(itemL) }).appendTo($('#' + newId)).attr("class", "list-group-item");
            });
        })
    .fail(function (jqXHR, textStatus, err) {
        $('#navbar-collapse-1').collapse('hide');
        Alert.show('Error: ' + err);
    });
}


function findH() {
    $('#navbar-collapse-1').collapse('hide');
    var prId = $('#prId').val();
    var _company = $('#_company').val();
    var _projManager = $('#_projManager').val();
    getUserInfo();
    var url = uriPR + '/?prid=' + prId + '&_company=' + _company;
    $.ajax(url, {
        type: "GET",
        headers: getHeaders()
    })
        .done(function (data) {
            // On success, 'data' contains a list of PRs.
            // Add a list item for the PR.
            var newId = "purchReqHeadersProjManager"
            //$('#prHeader').append('<div class="card-block">' + '<ul id = ' + newId + ' class = "list-group list-group-flush">' + '<strong>' + formatItemH(data) + '</strong>' + '</ul>');
            $('#prHeader').append('<div class="card-block">' + '<ul id = ' + newId + ' class = "list-group list-group-flush">' + formatItemH(data) + '</ul>');
            purchReqLinesPR(data.RecId, newId);
            getWorkflowItemProjManagerPR(data.PurchReqId, newId);
  
        })
      .fail(function (jqXHR, textStatus, err) {
          $('#navbar-collapse-1').collapse('hide');
          Alert.show('Error: ' + err);
      });

}


function findbyProjManager() {
    $('#navbar-collapse-1').collapse('hide');
    getUserInfo();
    var _company = $('#_company').val();
    var userName = localStorage.getItem("userName");
    if ($('#_projManager').val()) {
        var _projManager = $('#_projManager').val();
    }
    else {
        var _projManager = userName;
    }
    // Send an AJAX request
    var url = uriH + '?' + '_company=' + _company + '&' + '_projManager=' + _projManager;
    $.ajax(url, {
        type: "GET",
        headers: getHeaders()
    })
        .done(function (data) {
            // On success, 'data' contains a list of PRs.
            $.each(data, function (key, itemH) {
                // Add a list item for the PR.
                var newId = "purchReqHeadersProjManager" + key
                $('#prHeader').append('<div class="card-block">' + '<ul id = ' + newId + ' class = "list-group list-group-flush">' + formatItemH(itemH) + '</ul>');

            
                let asyncTest = () => {
                    purchReqLinesPR(itemH.RecId, newId);
                    sleep(5);
                    setTimeout(() => getWorkflowItemProjManagerPR(itemH.PurchReqId, newId),1); //should always happen last because of settimeout
                }
            
                asyncTest();
             

            
            });
        })
    .fail(function (jqXHR, textStatus, err) {
        $('#navbar-collapse-1').collapse('hide');
        Alert.show('Error: ' + err);
    });

}

function findbyProjManagerCompleted() {
    $('#navbar-collapse-1').collapse('hide');
    var _company = $('#_company').val();
    var _projManager = $('#_projManager').val();
    $('#prHeaderCompleted').empty();
    // Send an AJAX request
    var url = uriHC + '?' + '_company=' + _company + '&' + '_projManager=' + _projManager;
    $.ajax(url, {
        type: "GET",
        headers: getHeaders()
    })
        .done(function (data) {
            // On success, 'data' contains a list of PRs.
            $.each(data, function (key, itemH) {
                // Add a list item for the PR.
                var newId = "purchReqHeadersProjManagerCompleted" + key
                //$('#prHeaderCompleted').append('<div class="card-block">' + '<ul id = ' + newId + ' class = "list-group list-group-flush">' + '<strong>' + formatItemH(itemH) + '</strong>' + '</ul>');
                $('#prHeaderCompleted').append('<div class="card-block">' + '<ul id = ' + newId + ' class = "list-group list-group-flush">' + formatItemH(itemH) + '</ul>');
                purchReqLinesPRCompleted(itemH.RecId, newId);
            });
        })
    .fail(function (jqXHR, textStatus, err) {
        $('#navbar-collapse-1').collapse('hide');
        Alert.show('Error: ' + err);
    });
}



function approvePR(_recId, _actionType, _approve, _comment) {
    $('#navbar-collapse-1').collapse('hide');
    var _company = $('#_company').val();
        var url = uriA + '?' + '_company=' + _company + '&' + '_recId=' + _recId + '&' + '_actionType=' + _actionType + '&' + '_approve=' + _approve + '&' + '_comment=' + _comment;
        $.ajax(url, {
            type: "GET",
            headers: getHeaders()
        })
            .done(function (data) {
                if (data) {
                    if (_actionType == 1) {
                        $('#navbar-collapse-1').collapse('hide');
                        Alert.show("Approval Successful");
                    }
                    if (_actionType == 6) {
                        $('#navbar-collapse-1').collapse('hide');
                        Alert.show("Rejection Successful");
                    }
                    if (_actionType == 3) {
                        $('#navbar-collapse-1').collapse('hide');
                        Alert.show("Request Change Successful");
                    }

                }
                else {
                    $('#navbar-collapse-1').collapse('hide');
                    Alert.show("PR operation fail. Please contact Admin!");
                }
            })
          .fail(function (jqXHR, textStatus, err) {
              $('#navbar-collapse-1').collapse('hide');
              Alert.show('Error: ' + err);
          })
        }


