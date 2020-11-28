/**
Author : Aditia © 2020
Date : Tue, 24 Nov 2020, - 13:47:38 WIB
Name : Instagram DL
cuma iseng aja buat nambah pengetahuan.
**/
const request = require('request');
const options = require('commander');
const fs = require('fs');

var white = "\033[37m"
var blue = "\033[34m"

function GraphAll(yurl, path){
	request({
		headers: {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"},
		url: `${yurl}`,
		method:"GET",
	}, (err, resp, html) => {
		if(!err && resp.statusCode == 200){
			var page = html.match(/window._sharedData\s=\s(.*?);/i);
			if(page !== null){
				try{
					var data = JSON.parse(page[1])
							.entry_data
							.PostPage[0]
							.graphql
							.shortcode_media
					var obj = Object.keys(data);
					if(obj.includes("video_url")){
						var url = data.video_url;
						var name = url.match(/\/(\d.*?\_\d.+\.mp4)/i);
						if(name !== null){
							console.log(` ${blue}[${white}video${blue}]${white} ${name}`);
							Download(
								url,
								path,
								name[1],
							);
						} else {
							console.error(" Error : Can't find filename")
						}
					} else if(obj.includes('edge_sidecar_to_children')){
						var opts = data.edge_sidecar_to_children.edges;
						opts.forEach((i) => {
							if(i.node.__typename == 'GraphVideo'){
								var url = i.node.video_url;
								var name = url.match(/\/(\d.*?\_\d.+\.mp4)/i);
								if(name !== null){
									console.log(` ${blue}[${white}video${blue}]${white} ${name[1]}`);
									Download(
										url,
										path,
										name[1],
									);
								} else {
									console.error(" Error : Can't find filename");
								}
							} else if(i.node.__typename == 'GraphImage'){
								var url = i.node.display_resources.slice(-1)[0].src;
								var name = url.match(/\/(\d.*?\_\d.+\.jpg)/);
								if(name !== null){
									console.log(` ${blue}[${white}image${blue}]${white} ${name[1]}`);
									Download(
										url,
										path,
										name[1],
									);
								} else {
									console.error(" Error : Can't find filename");
								}
							}
						});
					} else if(!obj.includes('video_url') && !obj.includes('edge_sidecar_to_children')){
						var url = data.display_resources.slice(-1)[0].src;
						var name = url.match(/\/(\d.*?\_\d.+\.jpg)/);
						if(name !== null){
							console.log(` ${blue}[${white}image${blue}]${white} ${name[1]}`);
							Download(
								url,
								path,
								name[1],
							);
						} else {
							console.error(" Error : Can't find filename");
						}
					} else {
						console.error(" Error : Cannot find url media file\n please check your url post");
					}
				} catch(e){
					console.error(` Error : ${e.message}`);
				}
			}
		} else {
			console.error(err);
		}
	});
}

function Download(yurl, path ,name){
	request(yurl)
		.pipe(
			fs.createWriteStream(
				`${path}` + `${name}`
			)
		);
}

function forFiles(file, path){
	fs.readFile(file,'utf-8',(err,teks) => {
		if(err) throw err;
		var xos = teks.split(/\r?\n/);
		xos.forEach((i,e) => {
			if(i.length !== 0){
				console.log(` ${blue}[${white}procs${blue}]${white} reading ${e+1} of ${xos.length} url`);
				GraphAll(i,path);
			}
		});
	});
}

function Main(){
	const banner = (`      Insta Media Downloader Cli-vers
          made by ${blue}aditia_dtz${white} © 2020
                 ƪ(‾_‾)ʃ`);
	options
		.version("0.9","-v, --version")
		.description(`${banner}`)
		.option("-u, --url <type>","single url post to download")
		.option("-o, --output <type>","output to save after download")
		.option("-f, --file <type>","download with list url file")
		.option("-i, --info","more informations")
		.parse(process.argv);
	if(options.url){
		if(options.output){
			GraphAll(
				options.url,
				options.output,
			);
		} else {
			console.error(" Required Path to save!");
		}
	} else if(options.file){
		if(options.output){
			forFiles(
				options.file,
				options.output,
			);
		}else{
			console.error(" Required Output to save file!");
		}
	} else if(options.info){
		console.log(`\n${banner}\n`);
		console.log(` Contact ${blue}=>${white} https://t.me/aditia_dtz`);
	} else {
		options.help();
	}
}
Main();
