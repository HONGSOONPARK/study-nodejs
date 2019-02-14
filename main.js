var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	var title;
	
	if(pathname === '/'){
	
		// fs.readFile(`data/${queryData.id}`,'utf-8',function(err, description){

		fs.readdir('./data', function(err, filelist){
			
			if(queryData.id === undefined){
				queryData.id = '';
			}
			var filteredId = path.parse(queryData.id).base;
			fs.readFile(`data/${filteredId}`,'utf-8',function(err, description){
			
			var control='';
			

			
			if(queryData.id === ''){
				title = 'Welcome';
				description = 'Hello, Node.js';
				control =`<a href="/create">create</a>`;
			}else{
				
				
				title = `${filteredId}`;
				
				var sanitizedTitle = sanitizeHtml(title);
				var sanitizedDescription = sanitizeHtml(description);
				control =`
				<a href="/update?id=${sanitizedTitle}">update</a>
				
				<form action="/delete_process" method="post">
					<input type="hidden" name="id" value="${sanitizedTitle}">
					<input type="submit" value="delete">
				</form>
				
				`;
				
			}
			
			var list = template.list(filelist);
			
			
			var body=`<h2>${sanitizedTitle}</h2> <p>${sanitizedDescription}</p> `;
			
		    var html = template.html(sanitizedTitle, list, body,control);
						
			response.writeHead(200);
			response.end(html);
			});
		//});
		});
	}else if(pathname === '/create'){
		
		fs.readdir('./data', function(err, filelist){
	
			
			title = 'WEB - create';
			//control =`<a href="/update?id=${title}">update</a>`;
			control = ``;
			

			var body = `
				<form
				action="/create_process"
				method="post">
					<p>
						<input type="text" name="title" placeholder="title">
					</p>
					<p>
						<textarea name="description" placeholder="text"></textarea>
					</p>
					<p>
						<input type="submit">
					</p>
				</form>
			`;

			var list = template.list(filelist);
			var html = template.html(title, list, body,control);
						
			response.writeHead(200);
			response.end(html);
		});
		
	}else if(pathname === '/create_process'){
			
		var body = ``;
		
		request.on('data', function(data){
			body += data;
						
			if(body.length > 1e6){
				request.connection.destroy();
			}
		});
		
		request.on('end', function(){
			var post = qs.parse(body);
				
			var title = post.title;
			var description = post.description;
						
			fs.writeFile(`data/${title}`, description, 'utf8', function(err){
				response.writeHead(302, {Location: `/?id=${title}`});
				response.end(body);
			});
			
		});
		
	

	}else if(pathname === '/update'){
	
		// fs.readFile(`data/${queryData.id}`,'utf-8',function(err, description){

		fs.readdir('./data', function(err, filelist){
			var filteredId = path.parse(queryData.id).base;
			fs.readFile(`data/${filteredId}`,'utf-8',function(err, description){
			
			var control='';
					
			title = queryData.id;
			//control =`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`;
						
			var list = template.list(filelist);

			var body = `
				<form
				action="/update_process"
				method="post">
				<input type="hidden" name="id" value="${title}">
					<p>
						<input type="text" name="title" placeholder="title" value="${title}">
					</p>
					<p>
						<textarea name="description" placeholder="text">${description}</textarea>
					</p>
					<p>
						<input type="submit">
					</p>
				</form>
			`;
			
		    var html = template.html(title, list, body, control);
						
			response.writeHead(200);
			response.end(html);
			});
		//});
		});
		
	}else if(pathname === '/update_process'){

			
		var body = ``;
		
		request.on('data', function(data){
			body += data;
						
			if(body.length > 1e6){
				request.connection.destroy();
			}
		});
		
		request.on('end', function(){
			var post = qs.parse(body);
			
			var id = post.id;			
			var title = post.title;
			var description = post.description;
			
			fs.rename(`data/${id}`,`data/${title}`,function(error){
				fs.writeFile(`data/${title}`, description, 'utf8', function(err){
					response.writeHead(302, {Location: `/?id=${title}`});
					response.end(body);
				});	
				
			});

		});
		
	}else if(pathname === '/delete_process'){

		var body = ``;
		
		request.on('data', function(data){
			body += data;
						
			if(body.length > 1e6){
				request.connection.destroy();
			}
		});
		
		request.on('end', function(){
			var post = qs.parse(body);
			var id = post.id;			
			var filteredId = path.parse(id).base;
			fs.unlink(`data/${filteredId}`, function(err){
				response.writeHead(302, {Location: `/`});
				response.end(body);				
					
			});


		});






	}else{
		
		response.writeHead(404);
		response.end('Not Found');
	}
	
	
	
   
 
});
app.listen(3000);