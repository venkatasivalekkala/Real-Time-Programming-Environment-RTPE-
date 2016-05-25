var codeMirror;
/* initializes the TextBox */
function init_firepad(sessionRef, userid) {
	// Initialize Firebase. firepad
	var firepadRef = new Firebase( sessionRef.toString().concat("/code")  );

	// Create CodeMirror (with line numbers and the JavaScript mode).
	codeMirror = CodeMirror(document.getElementById('firepad-container'), {
		lineNumbers: true,
		lineWrapping:true,
		mode: 'javascript',
		theme: 'midnight'
	});
	// Create Firepad.
	var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
		{
		defaultText: '// JavaScript Editing with RTPE\n Example \nfunction go(){\n  var message = "Hello, world.";\n  console.log(message);\n}',
		userId: userid
		}
	);
}
/* initializes the ChatBox  */
function init_chat(sessionRef, userId){
	var firechatRef = new Firebase(   sessionRef.toString().concat("/chat") );
	
	//color =  "#" + Math.random().toString(16).slice(2, 8);
	// Link to DOM elements
	var messageField = $('#messageInput');
	var messageList = $('#example-messages');

	// Listen for keypress Events
	messageField.keypress(function(e){
		if(e.keyCode == 13){ // return or enter key
			
			// Field Values
			var username =userId;
			var message = messageField.val();
			var chatColor = $('.firepad-userlist-color-indicator ').attr('style').split(':')[1]
" rgb(23, 92, 11);"

			// Save data to Firebase
			firechatRef.push({name:username +":", text:message, color:chatColor});
			// Empty message field
			messageField.val('');
		}
	});

	// Add a callback thats triggered for each chat message
	firechatRef.limitToLast(10).on('child_added', function(snapshot){
		// Get Data
		var data = snapshot.val();
		var username = data.name || 'anonymous';
		var message = data.text;
		var color = data.color;

		// Create elements message & sanitize text
		var messageElement = $("<li>");
		var nameElement = $("<strong class='example-chat-username' style='color:"+color+"'></strong>");
		nameElement.text(username);
		messageElement.text(message).prepend(nameElement);

		// Add Message
		messageList.append(messageElement);

		// scroll to bottom of message list
		messageList[0].scrollTop = messageList[0].scrollHeight;
	});
}

function init_online_bar(sessionRef, userId){
	fireOnlineBarRef =    new Firebase( sessionRef.toString().concat("/OnlineBar"));
	// Create a random ID to use as our user ID(we must give this to firepad and firepadUserList)
	//var userId = Math.floor(Math.random()*99999999999).toString();
	// create FirePadUserList ( with our desired Id)
	var firepadUserList = FirepadUserList.fromDiv(fireOnlineBarRef.child('users'),
		document.getElementById('userListContainer'), userId, userId);
	//var color = "#" + Math.random().toString(16).slice(2, 8);
	
}

/* helps to save one session per distinct url */
function getHash(){
	var ref = new Firebase('https://realtimeprogenv.firebaseio.com/');
	var hash = window.location.hash.replace(/#/g,'');
	if(hash){
		ref = ref.child(hash);
	}else{
		ref = ref.push(); // generate a unique location
		window.location = window.location+'#'+ref.key();// add it as a has to the url
	}
	return ref;
}


function createDownloadable(){
	content = codeMirror.doc.getValue()
	var blob = new Blob([content], {type : 'text/html'});
	var extension = "code." + $('#langSelect').val()  ;
	
	$('#downloadButton').attr('href',URL.createObjectURL(blob));
	$('#downloadButton').attr("download", extension);
	return URL.createObjectURL(blob);
}

function createLangBar(){
	var langs = ['c', 'c++', 'c#','css','basic','html', 'java','javascript','lua','pascal', 'perl','php','python','ruby','sql','xml'];	
	var extensions=[ '.c', '.cpp', '.cs', '.css' , '.bv', '.html','.java','.js','.lua','.pas','.pl', '.php', '.py', '.rb','.sql','.xml'];
	var langDropdown = $('#langSelect')
	for (i=0; i< langs.length ;  i++){
		var barElement = $("<option value='"+langs[i]+"' ></option>");
		if (langs[i] === 'javascript')
			barElement.attr('selected','selected');
		barElement.attr("name", extensions[i]);
		barElement.text(langs[i]);
		langDropdown.append(barElement);
	}
	langDropdown.attr('onchange','changeMode()')
}
function createThemeBar(){
	var themes = ['cobalt', 'default','eclipse','mdn-like', 'midnight', 'twilight','vibrant-ink'];
	var themeDropdown = $('#themeSelect');
	for( i = 0; i < themes.length; i++){
		var dropdownElem = $("<option value='"+themes[i]+"'></option>");
		if( themes[i] === 'midnight' )
			dropdownElem.attr('selected','selected');
		dropdownElem.text(themes[i]);
		themeDropdown.append(dropdownElem);
	}
	themeDropdown.attr('onchange', 'changeTheme()');
	
}

function changeTheme(){
	var theme = $("#themeSelect").val();
	codeMirror.setOption("theme",theme);
}
function changeMode(){
	var mode = $('#langSelect').val();
	codeMirror.setOption("mode",mode);
}

/* call functions when the DOM is ready for js code to be executed */
$(document).ready(function(){
		var userId = prompt("Enter your username (any)");
		//var userId = 'adrian';
		if ( userId == null || userId == "" )
			userId = 'GAYUSER' + Math.floor(Math.random() * 1000);
		var sessionRef = getHash();
		init_firepad(sessionRef, userId);
		init_online_bar(sessionRef, userId);
		createLangBar();
		createThemeBar();
		init_chat(sessionRef, userId);
		
});



