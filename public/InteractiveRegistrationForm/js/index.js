$(document).ready(function() {

    $(".button").click(function() {
        // $(".sidebar").toggle();
        console.log($(".section1").css("display"));
        if ($(".section1").css("display") == "none") {
            $(".section1").css({"display" : "block"});
            $(".section1").animate({left: '0'});
            $(".button div").css({"background-color": "#fff"});
        } else {
            $(".section1").animate({left: '-100%'}, function() {
                $(".section1").css({"display": "none"});
                $(".button div").css({"background-color": "#222"});
            });
        }
    });

});

window.onload = function(){


    conversationforms();

    function verify(res) {
        return $.ajax({
            url: "http://192.168.0.110/registration/verify",
            type: "post",
            data: res,
            async: false,
            dataType: "json"
        });
    }

    function conversationforms() {

        var branches = ['cse', 'cs', 'it', 'ec', 'eee', 'ce', 'me', 'ee', 'ic', 'dlcse', 'dlcs', 'dlit', 'dlec', 'dleee', 'dlce', 'dlme', 'dlee', 'dlic'];

        var conversationalForm = window.cf.ConversationalForm.startTheConversation({
            formEl: document.getElementById("form"),
            // context: document.getElementById("cf-context"),

            userInterfaceOptions: {
                controlElementsInAnimationDelay: 250,
                robot: {
                    robotResponseTime: 500,
                    chainedResponseTime: 400
                },
                user:{
                    showThinking: false,
                    showThumb: true
                }
            },

            flowStepCallback: function(dto, success, error)
            {

                if(dto.tag.id == "name"){
                    if(dto.tag.value.trim() != ""){
                        // conversationalForm.addRobotChatResponse("If you need to make any change, Click on your messages.");
                        return success();
                    }else {
                        return error();
                    }
                    //conversationalForm.stop("Stopping form, but added value");
                } else if(dto.tag.id == "admission_no"){
                    var str = dto.tag.value;
                    str = str.toLowerCase();

                    var re = /^[0-9]{2}[a-zA-Z]{2,5}[0-9]{3}$/;

                    if(re.test(dto.tag.value)){
                        var branch = "";

                        if (/^[a-zA-Z]$/.test(str.charAt(6))) {
                            branch = str.substr(2, 5);
                        } else if(/^[a-zA-Z]$/.test(str.charAt(5))) {
                            branch = str.substr(2, 4);
                        } else if(/^[a-zA-Z]$/.test(str.charAt(4))) {
                            branch = str.substr(2, 3);
                        } else {
                            branch = str.substr(2, 2);
                        }

                        if($.inArray(branch, branches) < 0) {
                            $("textarea").val("");
                            conversationalForm.addRobotChatResponse("Your Admission No. is Incorrect, It must be like 15cse075, 15cs075 or 15dlcse, Please try again");
                            return error("Incorrect Admission No.");
                        }
                        if (parseInt(str.substr(0,2)) > 18 || parseInt(str.substr(0,2)) < 14)  {
                            $("textarea").val("");
                            conversationalForm.addRobotChatResponse("Your Admission No. is Incorrect, It must be like 15cse075, 15cs075 or 15dlcse, Please try again");
                            return error("Incorrect Admission No.");
                        }

                        if (parseInt(str.slice(-3)) < 1 || parseInt(str.slice(-3)) > 250)  {
                            $("textarea").val("");
                            conversationalForm.addRobotChatResponse("Your Admission No. is Incorrect, It must be like 15cse075, 15cs075 or 15dlcse, Please try again");
                            return error("Incorrect Admission No.");
                        }


                        res = verify({'admission_no': dto.tag.value}).responseJSON;
                        if (res.status) {
                            return success();
                        } else {
                            $("textarea").val("");
                            conversationalForm.addRobotChatResponse("Shit! Someone already took your Admission Number");
                            // $("cf-chat-response text p:last").css({"background-color": '#ff4c4c'});
                            return error("Enter different Admission No");
                        }

                    } else {
                        $("textarea").val("");
                        conversationalForm.addRobotChatResponse("Your Admission No. is Incorrect, It must be like 16cse075 or 16cs075, Please try again");
                        return error("Incorrect Admission No.");
                    }
                } else if(dto.tag.name == "email"){
                    var re = /^\S+@\w+\.\w+$/;
                    if(re.test(dto.tag.value)) {

                        res = verify({'email': dto.tag.value}).responseJSON;
                        if (res.status) {
                            return success();
                        } else {
                            conversationalForm.addRobotChatResponse("Shit! Someone already took your Email Address");
                            return error("Email is already registered");
                        }
                    } else {
                        return error();
                    }
                } else if(dto.tag.name == "mobile"){
                    var re = /^[6-9]{1}[0-9]{9}$/;
                    if(re.test(dto.tag.value)) {
                        return success();
                    } else{
                        return error();
                    }
                } else if(dto.tag.name == "submit-form"){
                    if(dto.tag.value[0] == "Yupp") {
                        return success();
                    } else{
                        conversationalForm.addRobotChatResponse("Wants to make changes in the response ?, click on the respective answer to make changes.");
                        return error();
                    }
                }
                return success();
            },
            submitCallback: function(){
                // be aware that this prevents default form submit.
                var formDataSerialized = conversationalForm.getFormData(true);
                formDataSerialized['_token'] = $('input[type="hidden"]').val();
                console.log(formDataSerialized['_token']);
                console.log("Formdata, serialized:", formDataSerialized);
                $.post("http://192.168.0.110/registration/register", formDataSerialized,
                function(data){
                    if (data.status) {
                        conversationalForm.addRobotChatResponse("We have received your submission, Thank You!!");
                        conversationalForm.addRobotChatResponse("Get connected with us on our Facebook page to get updated with our other events.");

                    } else {
                        conversationalForm.addRobotChatResponse("Error, Please submit again");
                    }
                }, "json");
            }
        });
    }

};
