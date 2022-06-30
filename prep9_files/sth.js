//In Google Analytics you'll need to set up custom dimensions as follows
// Custom Dimension 1 = Canvas User ID --- Scope = User
// Custom Dimension 2 = Archived --- Scope = User
// Custom Dimension 3 = Canvas User Role --- Scope = User
// Custom Dimension 4 = Canvas Course ID --- Scope = Hit
// Custom Dimension 5 = Canvas Course Name --- Scope = Hit
// Custom Dimension 6 = Canvas Sub-Account ID --- Scope = Hit

(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

$(document).ready(function() {

    // START - More Google Analytics Tracking Code
    var sUserId
    var sUserRole
    var sTemp // Course ID from URL
    var _course
    var sCourseName = null
    var parent_account //Give you the subaccount_id that the course is in

    ////////////////// CHANGE UA # HERE /////////////////////
    ga('create', 'UA-108505559-1', 'auto');

    //Get User Information
    sUserId = ENV["current_user_id"]
    ga('set', 'dimension1', sUserId);


    //Get User Role
    if ($.inArray('admin', ENV['current_user_roles']) == -1 && $.inArray('teacher', ENV['current_user_roles']) == -1 && $.inArray('student', ENV['current_user_roles']) > -1) {
        sUserRole = "student"
    } else if ($.inArray('admin', ENV['current_user_roles']) == -1 && $.inArray('teacher', ENV['current_user_roles']) > -1) {
        sUserRole = "teacher"
    } else if ($.inArray('admin', ENV['current_user_roles']) > -1) {
        sUserRole = "admin"
    } else {
        sUserRole = "other"
    }

    ga('set', 'dimension3', sUserRole);

    //If the user is in a course
    try {
        sTemp = window.location.pathname.match(/\/courses\/(\d+)/);
        if (sTemp[1]) {

            //Get Course information - Course Name and parent sub-account id
            var d1 = $.get('/api/v1/courses/' + sTemp[1], function(_course) {
                parent_account = _course.account_id
                parent_account = parent_account.toString();
                sCourseName = _course.name
            });


            $.when(d1).done(function(_account) {
                // ...do stuff...
                ga('set', 'dimension4', sTemp[1]);
                ga('set', 'dimension5', sCourseName);
                ga('set', 'dimension6', parent_account);
                ga('send', 'pageview');
            });
        } else {
            ga('send', 'pageview');
        }
    } catch (err) {}

    // END - Google Analytics Tracking Code

});


// Custom JS for chaning UI fields

/*
----------------------------------
disabling the export content button
----------------------------------
*/


$(document).ready(function() {
    // Handler for .ready() called.
    $('button.offline_web_export').hide();
    $('input#course_organize_epub_by_content_type').hide();
});

/*
----------------------------------------------
Generate a universal "Student View" button on 
---------------------------------------------
 */
var universalStudentView = function() {
    var isTeacher, isCourse, courseId, templateButton, sutdentViewVisible, studentViewURL, getPath;
    
    // Determine if the user is actually a teacher
    if (ENV['current_user_roles'].includes('teacher') && $('.ic-app-course-menu.list-view nav #section-tabs li.section a[title="Settings"]').is(":visible")) {
        isTeacher = true;
    } else {
        isTeacher = false;
    }

    // Get the current Course ID and path based on the url of the course
    isCourse = window.location.href.indexOf("/courses/") > -1;
    getPath = window.location.pathname;
    
    // Determine if the template button is currently visible
    templateButton = $('.btn.button-sidebar-wide.element_toggler.choose_home_page_link').is(':visible');
    
    // Determine if the user is currently in student view
    studentViewVisible = $('.ic-alert-masquerade-student-view').is(':visible');

    // Validate rendering the universal button based on the variables

    /*

    If the user is truly a teacher for this course/student
     view is not already enabled, render the button 

     */
    if(isTeacher && isCourse && studentViewVisible == false) { 
        courseId = getPath.split('courses/').pop().split('/')[0]
        studentViewURL = "/courses/" + courseId + "/student_view";
        $('.ic-app-nav-toggle-and-crumbs.no-print').append('<a class="btn button-sidebar-wide quick-access" href="' + studentViewURL + '" rel="nofollow" data-method="post"><i class="icon-student-view" role="presentation"></i> Launch Student View</a>')
    } else { // If the user is not a teacher or student view is already enabled
        $('.ic-app-nav-toggle-and-crumbs.no-print').remove('.btn.button-sidebar-wide.quick-access')
    }
}


//Zendesk Widget

/*var customLoadZendeskWidget = function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'ze-snippet';
    script.async = true;
    script.src = 'https://static.zdassets.com/ekr/snippet.js?key=0532414e-ffa9-4278-9570-fff17d90b2e4';
    document.getElementsByTagName('head')[0].appendChild(script);
};*/
//u
/* ------------------ END FUNCTION SECTION */

/* ------------------ RUN ON PAGE LOAD */

var current_name = null;
var current_email = null;
var current_course = null;

$(document).ready(function () {
    universalStudentView();
    //customLoadZendeskWidget();
    
    /**
     * 
     * $.get('/api/v1/users/self/profile', function(profile) {
        console.log(JSON.stringify(profile));
        current_name = profile.name;
        current_email = profile.primary_email;

        zE('webWidget', 'updateSettings', {
            webWidget: {
            contactForm: {
                fields: [
                    { id: 'name', prefill: { '*': current_name } },
                    { id: 'email', prefill: { '*': current_email } }
                    ]
                }
            }
          });
    });
     */

    
    /*
    //get course id
    var url = window.location.href;
    if(url.includes('courses/')){
        var course_str = url.substr(url.indexOf('course'));
        var segments = course_str.split('/');
        console.log('course ID'+segments[1]);
        $.get('/api/v1/courses/'+segments[1], function(course) {
            console.log(JSON.stringify(course));
            current_course = course;

            zE('webWidget', 'updateSettings', {
                webWidget: {
                    contactForm: {
                        title: {
                            '*': course.course_code+' Support'
                        },
                        fields: [{ id:'subject', prefill: { '*': course.course_code }}]
                    }
                }
              });
        });  
    }*/

    /*
    ----------------------------------------------
    *Dynamically add Topic Feedback START
    ---------------------------------------------
    */


    function createFragment(htmlStr){
        var fragment = document.createDocumentFragment(),
        $element = document.createElement('div');

        $element.innerHTML = htmlStr;
        while($element.firstChild){
            fragment.appendChild($element.firstChild);
        }
        return fragment;
    }

    var $target = document.querySelector('.show-content');
    // htmlStr = `HELLO WORLD!!!!`;
    htmlStr = `<iframe id="fs-iframe" title="Content Page Rating" src="https://moringa.formstack.com/forms/student_contract_copy" width="100%" height="400x"></iframe>`
    $target.appendChild(createFragment(htmlStr));
    /*
    ----------------------------------------------
    *Dynamically add Topic Feedback END
    ---------------------------------------------
    */



    /*
    ----------------------------------------------
    *Populate Formstack Feedback form START
    ---------------------------------------------
    */

    const fs_iframe = document.getElementById("fs-iframe")

    // Make sure the iframe is loaded
    fs_iframe.addEventListener("load", function(){

        data = {}
        const url = window.location.href;

        console.log(url)

        if(url.includes('courses/')){
            let course_str = url.substr(url.indexOf('course'));
            let course_segments = course_str.split('/');
            let page_str = url.substr(url.indexOf('pages'));
            let page_segments = page_str.split('/');
            console.log('course ID'+course_segments[1]);
            console.log('Page Title'+page_segments[1]);
            
            // Retrieve course information
            $.get('/api/v1/courses/'+course_segments[1], function(course) {
                current_course = course.course_code;
                course_start = course.start_at
                course_end = course.end_at

                console.log(current_course)

                if (!/\d+/.test(current_course)){
                    
                    console.log("Course Offering does not have term number included")
                    return
                }
                if(!course_start||!course_end){
                    console.log("This Course Offering is either Blueprint or does not have start or end date included")
                    return
                }

                data["course_code"] =  current_course
                data["course_start"] = course_start.split("T")[0]
                data["course_end"] = course_end.split("T")[0]

               
                if (current_course.toLocaleLowerCase().includes("PT")){

                    data["term"] = `${current_course.slice(0, 4)}${current_course.match(/\d+/)[0]}`
                }else{
                    data["term"] = `${current_course.slice(0, 2)}${current_course.match(/\d+/)[0]}`
                }
                
                 $.get(`/api/v1/courses/${course_segments[1]}/pages/${page_segments[1]}`, function(page) {

                    page_title = page.title
                    page_id = page.page_id
                    page_created_at = page.created_at
                    page_updated_at = page.updated_at
                    page_url = page.html_url
                    _url = page.url

                    console.log(`Page url: ${page_url}`)

                    data["page_title"] = page_title
                    data["page_id"] = page_id
                    data["page_created_at"] = page_created_at 
                    data["page_updated_at"] = page_updated_at
                    data["page_url"] = page_url
                    data["_url"] = _url

                                    // Get the current user profile
                    $.get('/api/v1/users/self/profile', function(profile) {

                        //console.log(JSON.stringify(profile));
                        current_user_id = profile.id;
                        current_user_name = profile.name;
                        current_user_email = profile.primary_email;
                        sis_id = profile.sis_user_id;

                        // debugg log
                        console.log(current_user_id);
                        console.log(current_user_email);

                        // data object
                        data["id"] =  current_user_id
                        data["name"] =  current_user_name
                        data["email"] =  current_user_email
                        data["contactId"] = sis_id

                        console.log(sis_id)
                        console.log(data["course_code"])
                        fs_iframe.contentWindow.postMessage(data, "*")
                        console.log("I. data passed")

                    }); 

                 })

            });  
        }

        
    })

    /*
    ----------------------------------------------
    *Populate Formstack Feedback form END
    ---------------------------------------------
    */



});


/*window.zE||function(t, e, a) {
    var s = [],
        c = function () {
           s.push(arguments)
        },
        n = t.createElement(e);
    n.type = "text/javascript";
    n.src = "https://static.zdassets.com/ekr/snippet.js?key=" + a;
    n.setAttribute("charset", "utf-8");
    n.async = true;
    c._ = s;
    c.t = Date.now();
    c.s = n;
    window.zE = window.zEmbed = c;
    t.getElementsByTagName("head")[0].appendChild(n);
    window.zESettings = {
       webWidget: {
          launcher: {
             chatLabel: {
                '*': 'Moringa School Support '
             }
          },
          contactForm: {
            title: {
              '*': 'Moringa School Support'
            },
            subject: true,
            fields: [
                { id: 'name', prefill: { '*': current_name } },
                { id: 'email', prefill: { '*': current_email } },
                { id:'subject'}
              ]
          },
          position: {
             horizontal: 'right',
             vertical: 'bottom'
          }
       }
    }
 }
 (document,"script","0532414e-ffa9-4278-9570-fff17d90b2e4");*/

// end of student view by teachers



/*
---------------------
view feedback function while submitting assignments
--------------------------
*/

$(window).bind('load', function() {
    // sets variables equal to the  doc button and the feedback buttons
    var getDocButton = $('.submission-details-frame iframe').contents().find('a.file-upload-submission-info__link')
    var getFbButton = $('.submission-details-frame iframe').contents().find('a.modal_preview_link.Button--link')
    
    // Add classes to target variables to specify css for those elements
    getDocButton.addClass('download')
    getFbButton.addClass('feedback-btn')

    // Handles clicking view feedback button
    $(document).on('click', 'a.feedback-btn', function() {
            window.parent.$('.submission-details-frame iframe').contents().find('.ui-widget-overlay').removeClass('for-feedback'); // always set overlay to normal state when first opened
            window.parent.$('.submission-details-frame iframe').contents().find('.ui-widget-overlay').append('<div class="expand-btn"></div>') // Adds the fullscreen button to the overlay container
    })

    // Handles clicking fullscreen button
    $(document).on('click', 'div.expand-btn', function() {
        if(window.parent.$('.submission-details-frame iframe').contents().find('.ui-widget-overlay').hasClass('for-feedback')) { // Only do this if the overlay already has the for-feedback class
            // Removes expand and for-feedback classes, returning window sizes to no fullscreen and reseting document view
            window.parent.$('#preview_frame').removeClass('expand')
            window.parent.$('.submission-details-frame iframe').contents().find('div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-draggable.ui-resizable').removeClass('for-feedback');
            window.parent.$('.submission-details-frame iframe').contents().find('.ui-dialog-content.ui-widget-content').removeClass('for-feedback');
            window.parent.$('.submission-details-frame iframe').contents().find('.ui-widget-overlay').removeClass('for-feedback');
            window.parent.$('.submission-details-frame iframe').contents().find('div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-draggable.ui-resizable').css({'min-height': '97px','height': '200px', 'width' : '90%'});
            window.parent.$('.submission-details-frame iframe').contents().find('.ui-dialog-content.ui-widget-content').css('width', '100%');
        } else { // overlay doesn't have for-feedback class
            // Adds expand and for-feedback classes, enlarging containers and taking doc view to full screen
            window.parent.$('#preview_frame').addClass('expand')
            window.parent.$('.submission-details-frame iframe').contents().find('div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-draggable.ui-resizable').addClass('for-feedback');
            window.parent.$('.submission-details-frame iframe').contents().find('.ui-dialog-content.ui-widget-content').addClass('for-feedback');
            window.parent.$('.submission-details-frame iframe').contents().find('.ui-widget-overlay').addClass('for-feedback');
        }
    });

    // Handles close button of doc view being clicked
    $(document).on('click', 'span.ui-icon.ui-icon-closethick',function() {
        // Removes expand and for-feedback classes, returning window sizes to no fullscreen and reseting document view
        // Completely removes fullscreen button from overlay container  
        window.parent.$('.submission-details-frame iframe').contents().find('div.expand-btn').remove();
        window.parent.$('#preview_frame').removeClass('expand')
        window.parent.$('.submission-details-frame iframe').contents().find('div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-draggable.ui-resizable').removeClass('for-feedback');
        window.parent.$('.submission-details-frame iframe').contents().find('.ui-dialog-content.ui-widget-content').removeClass('for-feedback');
        window.parent.$('.submission-details-frame iframe').contents().find('.ui-widget-overlay').removeClass('for-feedback');
    })

});