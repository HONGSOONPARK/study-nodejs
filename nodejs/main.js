var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');


var app = http.createServer(function(request,response){
    var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	var title;
	
	
	function templateHTML(title, list, body, control){
		return `
			<!doctype html><html> <head>
				<title>WEB1 - ${title} </title>  
				<meta charset="utf-8"> </head>
			<body>   
				<h1><a href="/">WEB</a></h1> 
				${list}
				${control}
				${body}
			</body> 
			</html>
			`;
	}
	
	function templateList(filelist){
		var r_list = `<ul>`;
			var i = 0;
			
			while(i < filelist.length){
				r_list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
				i += 1;
			}				
					
			r_list += `</ul>`;
		return r_list;
	}
	
	
	if(pathname === '/'){
	
		// fs.readFile(`data/${queryData.id}`,'utf-8',function(err, description){

		fs.readdir('./data', function(err, filelist){
			
			fs.readFile(`data/${queryData.id}`,'utf-8',function(err, description){
			var control='';
			
			if(queryData.id === undefined){
				title = 'Welcome';
				description = 'Hello, Node.js';
				control =`<a href="/create">create</a>`;
			}else{
				title = queryData.id;
				control =`
				<a href="/update?id=${title}">update</a>
				
				<form action="/delete_process" method="post">
					<input type="hidden" name="id" value="${title}">
					<input type="submit" value="delete">
				</form>
				
				`;
				
			}
			
			var list = templateList(filelist);
			
			
			var body=`<h2>${title}</h2> <p>${description}</p> `;
			
		    var template = templateHTML(title, list, body,control);
						
			response.writeHead(200);
			response.end(template);
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
			
			

			var list = templateList(filelist);
			var template = templateHTML(title, list, body,control);
						
			response.writeHead(200);
			response.end(template);
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
			
			fs.readFile(`data/${queryData.id}`,'utf-8',function(err, description){
			
			var control='';
					
			title = queryData.id;
			//control =`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`;
						
			var list = templateList(filelist);

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
			
		    var template = templateHTML(title, list, body, control);
						
			response.writeHead(200);
			response.end(template);
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
			
			fs.unlink(`data/${id}`, function(err){
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
