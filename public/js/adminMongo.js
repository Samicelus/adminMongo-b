$(document).ready(function() {  
    // paginate if value is set
    if($("#to_paginate").val() == "true"){
        if(localStorage.getItem('message_text') != ""){
            show_notification(localStorage.getItem('message_text'), "success");
            localStorage.setItem('message_text', "");
        }
        paginate();
    }
    
    // To reset we call paginate() with no query object
    $("#searchReset").click(function() {
        if(!$('#searchReset').hasClass("disabled")){
            localStorage.removeItem('searchQuery');
            window.location.href = $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + $("#coll_name").val() + "/view/1";
        }
    });
    
    $("#queryDocumentsAction").click(function() {
        var editor = ace.edit("json");
        var editor_val = editor.getValue();

        if(editor_val != ""){
            // set the query in localStorage
            localStorage.setItem('searchQuery',editor_val);
            
            // go to page 1 to remove any issues being on page X from another query/view
            window.location.href = $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + $("#coll_name").val() + "/view/1";
            
            // close the queryDocuments
            $('#queryDocuments').modal('hide');
        }else{
            show_notification("Please enter a query","danger");
        }
    });
    
    // redirect to export
    $("#exportModalAction").click(function() {
        var exportId = $("#exportExcludeID").is(":checked") ? "true" : "false";
        window.location.href = $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + $('#export_coll').val() + "/export/" + exportId;
    });
    
    // sets the collection name to be used later to export entire collection
    $(".exportLink").click(function() {  
        $('#exportExcludeID').prop('checked', false);
        $('#export_coll').val($(this).attr("id"));
    });
    
    // set the URL search parameters
    $("#searchModalAction").click(function() {
        var key_name = $("#search_key_fields option:selected").text();
        var val = $("#search_value_value").val();

        if(key_name != "" && val != ""){
            // build the simply key/value query object and call paginate();
            var qry_obj = {};

            // check if value is a number/integer
            var intReg = new RegExp('^[0-9]+$');
            var objectIdReg = new RegExp('^ObjectId[\(\)a-z0-9A-Z]+$');
            if(val.match(intReg)){
                val = parseInt(val);
            }
            else if ( key_name.toString().toLowerCase() == "_id") {
               if (!val.match(objectIdReg))  {
                   val = {"$oid" : val.toString()};
               }
            }
            else{
            // if we find an integer wrapped in quotes
                var strIntReg = new RegExp('^"[0-9]"+$');
                if(val.match(strIntReg)){
                    val = val.replace(/"/g,'');
                }
            }
                
            qry_obj[key_name] = val;
            
            // set the object to local storage to be used if page changes
            localStorage.setItem('searchQuery',JSON.stringify(qry_obj));
            
            // go to page 1 to remove any issues being on page X from another query/view
            window.location.href = $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + $("#coll_name").val() + "/view/1";
            
            // close the searchModal
            $('#searchModal').modal('hide');
        }else{
            show_notification("Please enter a key (field) and a value to search for","danger");
        }
    });
    
    $("#coll_name_edit").click(function() {
        var newCollName = $("#coll_name_newval").val();
        if(newCollName != ""){
            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + $("#coll_name").val() + "/coll_name_edit",
                data: {"new_collection_name" : newCollName}
            })
            .success(function(data) {
                $("#headCollectionName").text(newCollName);
                $('#collectioName').modal('toggle');
                localStorage.setItem('message_text', data.msg);
                window.location.href = $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + newCollName + "/view?page=1";
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }
        else{
            show_notification("Please enter an index","danger");
        }
    });

    $("#coll_create").click(function() {
        if($("#new_coll_name").val() != ""){
            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val()+ "/coll_create",
                data: {"collection_name" : $("#new_coll_name").val()}
            })
            .success(function(data) {
                $("#del_coll_name").append('<option>' + $("#new_coll_name").val() + '</option>');
                $("#new_coll_name").val('');
                show_notification(data.msg,"success");
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }else{
            show_notification("Please enter a collection name","danger");
        }
    });
    
    $("#coll_delete").click(function() {
        if (confirm("WARNING: Are you sure you want to delete this collection and all documents?") == true) {
            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/coll_delete",
                data: {"collection_name" : $("#del_coll_name option:selected" ).text()}
            })
            .success(function(data) {
                $("#del_coll_name option:contains('" + data.coll_name + "')").remove();
                $("#del_coll_name").val($("#del_coll_name option:first").val());
                show_notification(data.msg,"success");
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }
    });
    
    $("#db_create").click(function() {
        if($("#new_db_name").val() != ""){
            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/" + $("#conn_name").val() + "/db_create",
                data: {"db_name" : $("#new_db_name").val()}
            })
            .success(function(data) {
                $("#del_db_name").append('<option>' + $("#new_db_name").val() + '</option>');
                $("#new_db_name").val('');
                show_notification(data.msg,"success");
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }else{
            show_notification("Please enter a database name","danger");
        }
    });
    
    $("#db_delete").click(function() {
        if (confirm("WARNING: Are you sure you want to delete this collection and all documents?") == true) {
            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/" + $("#conn_name").val() + "/db_delete",
                data: {"db_name" : $("#del_db_name option:selected" ).text()}
            })
            .success(function(data) {
                $("#del_db_name option:contains('" + data.db_name + "')").remove();
                $("#del_db_name").val($("#del_db_name option:first").val());
                show_notification(data.msg,"success");
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }else{
            show_notification("Please enter a database name","danger");
        }
    });
    
    $("#user_create").click(function() {
        if($("#new_username").val() == ""){
            show_notification("Please enter a Username","danger");
            return;
        }
        if($("#new_password").val() == "" || $("#new_password_confirm").val() == ""){
            show_notification("Please enter a password and confirm","danger");
            return;
        }
        if($("#new_password").val() != $("#new_password_confirm").val()){
            show_notification("Passwords do not match","danger");
            return;
        }

        $.ajax({
            method: "POST",
            url: $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/na/user_create",
                data: {
                    "username": $("#new_username").val(),
                    "user_password": $("#new_password").val(),
                    "roles_text": $("#new_user_roles").val()
                }
        })
        .success(function(data) {
            $("#del_user_name").append('<option>' + $("#new_username").val() + '</option>');
            show_notification(data.msg,"success");

            // clear items
            $("#new_username").val('');
            $("#new_password").val('');
            $("#new_password_confirm").val('');
            $("#new_user_roles").val('');
        })
        .error(function(data) {
            show_notification(data.responseJSON.msg,"danger");
        });
    });
    
    $("#btnqueryDocuments").click(function() {
        var editor = ace.edit("json");
        if(localStorage.getItem('searchQuery')){
            editor.setValue(localStorage.getItem('searchQuery'));
        }else{
            editor.setValue("{}");
        }
    });
    
    $("#user_delete").click(function() {
        if(confirm("WARNING: Are you sure you want to delete this user?") == true) {
            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/na/user_delete",
                data: {"username": $("#del_user_name option:selected" ).text()}
            })
            .success(function(data) {
                $("#del_user_name option:contains('" + $("#del_user_name option:selected" ).text() + "')").remove();
                $("#del_user_name").val($("#del_user_name option:first").val());
                show_notification(data.msg,"success");
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }
    });
    
    $("#add_config").click(function() {
        if($("#new_conf_conn_name").val() != "" && $("#new_conf_conn_string").val() != ""){
            var editor = ace.edit("json");
            var editor_val = editor.getValue();

            if(editor_val == ""){
                editor_val = {};
            }

            var data_obj = {};
            data_obj[0] = $("#new_conf_conn_name").val();
            data_obj[1] = $("#new_conf_conn_string").val();
            data_obj[2] = editor_val;

            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/add_config",
                data: data_obj
            })
            .success(function(data) {
                show_notification(data.msg,"success");
                setInterval(function() {
                    location.reload();
                }, 2500);
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }else{
            show_notification("Please enter both a connection name and connection string","danger");
        }
    });

    $(".btnConnDelete").click(function() {
        if(confirm("WARNING: Are you sure you want to delete this connection?") == true) {
            var current_name = $(this).parents('.conn_id').attr("id");
            var rowElement = $(this).parents('.connectionRow');

            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/drop_config",
                data: {"curr_config":  current_name}
            })
            .success(function(data) {
                rowElement.remove();
                show_notification(data.msg,"success");
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }
    });

    $(".btnConnUpdate").click(function() {
        if($("#conf_conn_name").val() != "" || $("#conf_conn_string").val() != "") {
            var current_name = $(this).parents('.conn_id').attr("id");
            var new_name = $(this).parents('.connectionRow').find('.conf_conn_name').val();
            var new_string = $(this).parents('.connectionRow').find('.conf_conn_string').val();

            $.ajax({
                method: "POST",
                url: $("#app_context").val() + "/update_config",
                data: {"curr_config":  current_name, "conn_name": new_name, "conn_string": new_string}
            })
            .success(function(data) {
                $(this).parents('.connectionRow').find('.conf_conn_name').val(data.name);
                $(this).parents('.connectionRow').find('.conf_conn_string').val(data.string);
                show_notification(data.msg,"success", true);
            })
            .error(function(data) {
                show_notification(data.responseJSON.msg,"danger");
            });
        }else{
            show_notification("Please enter a connection name and connection string","danger");
        }
    });

    // redirect to connection
    $(".btnConnConnect").click(function() {
        window.location.href = $("#app_context").val() + "/" + $(this).parents('.conn_id').attr("id");
    });
});

function redirect(url){
    window.location = url;
} 

function paginate(){
    $('#doc_load_placeholder').show();
    
    var page_num = $('#page_num').val();
    var page_len = $('#docs_per_page').val();
    var coll_name = $('#coll_name').val();
    var conn_name = $('#conn_name').val();
    var db_name = $('#db_name').val();
    
    // get the query (if any)
    var query_string = localStorage.getItem('searchQuery');
    query_string = toEJSON.serializeString(query_string);
    
    // add search to the API URL if it exists
    var api_url = $("#app_context").val() + '/api/' +  conn_name + '/' + db_name + '/' + coll_name + '/' + page_num;
    var pager_href = $("#app_context").val() + '/' +  conn_name + '/' + db_name + '/' + coll_name + '/view/{{number}}';
    
    $.ajax({
        type: "POST",
        dataType: 'json',
        url: api_url,
        data: {"query" : query_string}
    })
    .done(function(response) {
        // show message when none are found
        if(response.data == ""){
            $('#doc_none_found').removeClass('hidden');
        }else{
            $('#doc_none_found').addClass('hidden');
        }
        
        var total_docs = Math.ceil(response.total_docs / page_len);
        
        $('#pager').bootpag({
            total: total_docs,
            page: page_num,
            maxVisible: 5,
            href: pager_href
        });

        var isFiltered = "";

        // enable/disable the reset filter button
        if(query_string == null){
            $('#searchReset').addClass("disabled");
        }else{
            $('#searchReset').removeClass("disabled");
            isFiltered = " <span class='text-danger'>(filtered)</span>";
        }

         // set the total record count
        $('#recordCount').html(response.total_docs + isFiltered);
        
        //clear the div first
        $('#coll_docs').empty();
        for (var i = 0; i < response.data.length; i++) {
            var inner_html = '<div class="col-xs-12 col-md-8 col-lg-10 no-pad-left"><pre class="code-block doc_view"><code class="json">' + JSON.stringify(response.data[i]) + '</code></pre></div>';
            inner_html += '<div class="col-xs-6 col-md-2 col-lg-1 text-right no-side-pad pad-bottom"><a href="' + $("#app_context").val() + '/'+ conn_name + '/' + db_name + '/' + coll_name + '/edit/' + response.data[i]._id + '" class="btn btn-success btn-sm">' + response.editButton + '</a></div>';
            inner_html += '<div class="col-xs-6 col-md-2 col-lg-1 text-left pad-bottom"><a href="#"  class_="btn btn-danger btn-sm" onclick="deleteDoc(\''+response.data[i]._id+'\')" style="margin-right: 15px; margin-left: 15px;">' + response.deleteButton + '</a></div>';
            $('#coll_docs').append(inner_html);
        };

        //Bind the DropDown Select For Fields
        var option = '';
        for (var i=0;i<response.fields.length;i++){
            option += '<option value="'+ response.fields[i] + '">' + response.fields[i] + '</option>';
        }
        $('#search_key_fields').append(option);
        
        $('#doc_load_placeholder').hide();
        
        // hook up the syntax highlight and prettify the json
        $(".code-block").each(function (i, block) { 
            var jsonString = this.textContent;
            var jsonPretty = JSON.stringify(JSON.parse(jsonString),null,2);
            $(this).html(jsonPretty);
            hljs.highlightBlock(block);
        });

        // Show extended message if API returns an invalid query
        if(response.validQuery == false){
            show_notification("Invalid query syntax" + response.queryMessage, "danger", false, 3000);
        }
    })
    .fail(function() {
        show_notification("Error getting data from Query API","danger");
    });
}

function deleteDoc(doc_id){
    if(confirm("WARNING: Are you sure you want to delete this document?") == true) {
        $.ajax({
            method: "POST",
            url: $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + $("#coll_name").val() + "/doc_delete",
            data: {"doc_id": doc_id}
        })
        .success(function(data) {
            show_notification(data.msg,"success");
            paginate();
        })
        .error(function(data) {
            show_notification(data.responseJSON.msg,"danger");
        });
    }
}

$("#coll_addindex").click(function() {
    var edit = ace.edit("json");
    var json = $.parseJSON(edit.getValue());
    
    if(json != "{}"){
        var data_obj = {};
        data_obj[0] = JSON.stringify(json);
        data_obj[1] = $("#index_unique").is(":checked") ? "true" : "false";
        data_obj[2] = $("#index_sparse").is(":checked") ? "true" : "false";
        
        $.ajax({
            method: "POST",
            url: $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + $("#coll_name").val() + "/create_index",
            data: data_obj 
        })
        .success(function(data) {
            show_notification(data.msg,"success", true);
        })
        .error(function(data) {
            show_notification(data.responseJSON.msg,"danger");
        });
    }
    else{
        show_notification("Please enter an index","danger");
    }
});

function dropIndex(index_index){
    $.ajax({
        method: "POST",
        url: $("#app_context").val() + "/" + $("#conn_name").val() + "/" + $("#db_name").val() + "/" + $("#coll_name").val() + "/drop_index",
        data: {"index": index_index}
    })
    .success(function(data) {
        $('#index_row_' + index_index).remove();
        show_notification(data.msg,"success");
    })
    .error(function(data) {
        show_notification(data.responseJSON.msg,"danger");
    });
}

// show notification popup
function show_notification(msg, type, reload_page, timeout){
    // defaults to false
    reload_page = reload_page || false;
    timeout = timeout || 3000;
   
    $("#notify_message").removeClass();
    $("#notify_message").addClass('notify_message-' + type);
    $("#notify_message").html(msg);
    $('#notify_message').slideDown(600).delay(timeout).slideUp(600, function() {
        if(reload_page == true){
            location.reload();
        }
    });
}