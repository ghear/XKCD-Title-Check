// KPR Script file

var startXKCDNum = 1;
var currentXKCDNum = 0;


// Handlers

Handler.bind('/getCurrentXKCD', {
		onInvoke: function(handler, message) {
				handler.invoke(new Message('http://xkcd.com/info.0.json'), Message.JSON);
				},
		onComplete: function(handler, message, json) {
			currentXKCDNum = json.num;
			trace('current xkcd num is ' + currentXKCDNum + '\n');
			application.invoke(new Message('/getXKCDWithNum'));
		}
});

var comicDifferenceStyle = new Style({font:'16px bold', color: 'white', align:'center,middle'});

Handler.bind('/getXKCDWithNum', {
		onInvoke: function(handler, message) {
			url = 'http://xkcd.com/' + startXKCDNum + '/info.0.json';
			handler.invoke(new Message(url), Message.JSON);
			},
		onComplete: function(handler, message, json) {
			mainColumn.header.comicNum.string = "Checking: " + json.num;
			if (startXKCDNum % 100 == 0) {
				trace("On comic " + startXKCDNum + ". Still running...\n");
			}
			if ((json.title === json.safe_title)) {
				//trace("Comic " + json.num + ': EQUIVALENT\n');
			} else {
				uniqueComics[json.num] = [json.title, json.safe_title];
				trace("Comic " + json.num + ": " + json.title + " is different than " + json.safe_title + "\n");
				mainColumn.tallyContainer.tally.string += 'X';

				var uniqueComicNumLine = new Line({left:0, right:0, top:0, bottom:0, height:20, skin: darkPinkSkin});
				var uniqueComicNum = new Label({left:0, right:0, top:0, bottom:0, style: comicDifferenceStyle, name: json.num, string:json.num});
				uniqueComicNumLine.add(uniqueComicNum);
				
				var uniqueComicSafeTitleContainer = new Line({left:0, right:0, top:0, bottom:0, height:30, skin: darkPinkSkin});
				var uniqueComicSafeTitle = new Label({left:0, right:0, top:0, bottom:0, style: comicDifferenceStyle, string:'safe_title: ' + json.safe_title});
				uniqueComicSafeTitleContainer.add(uniqueComicSafeTitle);
				
				var uniqueComicTitleContainer = new Line({left:0, right:0, top:0, bottom:0, height:30, skin: darkPinkSkin});
				var uniqueComicTitle = new Label({left:0, right:0, top:0, bottom:0, style: comicDifferenceStyle, string:'title: ' + json.title});
				uniqueComicTitleContainer.add(uniqueComicTitle);
				
				var uniqueComic = new Column({left:0, right:0, top:5, bottom:5, height:90, skin: darkPinkSkin, name: json.num});
				
				uniqueComic.add(uniqueComicNumLine);
				uniqueComic.add(uniqueComicSafeTitleContainer);
				uniqueComic.add(uniqueComicTitleContainer);
				
				
				mainColumn.differences.add(uniqueComic);
				
			}
			startXKCDNum++;
			if (startXKCDNum == 404) {
				startXKCDNum++;
			}
			if (startXKCDNum <= currentXKCDNum) {
				application.invoke(new Message('/getXKCDWithNum'));
			} else {
				mainColumn.header.comicNum.string = 'All Checked!';
			}
		}
});


// UI

var lightPinkSkin = new Skin({fill:'#FFEFADC9'});
var whiteSkin = new Skin({fill:"white"});
var darkPinkSkin = new Skin({fill:'#FFE17EA8'});
var tallyBackgroundSkin = new Skin({fill:'#FF48AC6D'});
var blackSkin = new Skin({fill: 'black'});
var redSkin = new Skin({fill: 'red'});

var comicNumberStyle = new Style({font:'44px bold', color: 'white', align:'center,middle'});
var tallyStyle = new Style({font:'62px bold', color: '#FFCD3640', align: 'left'});

var mainColumn = new Column({
						left:0, right:0, top:0, bottom:0,
						skin: whiteSkin,
						contents: [
							new Line({left:0, right:0, top:0, bottom:0, height: 30, skin:darkPinkSkin, name: 'header',
										contents:[
											new Label({left:0, right:0, top:0, bottom:0, style: comicNumberStyle, name:'comicNum', string:'Checking: 0'}),
										]
									}),
							new Line({left:0, right:0, top:0, bottom:0, height:30, skin: tallyBackgroundSkin, name: 'tallyContainer',
										contents: [
											new Label({left:0, right:0, top:0, bottom:0, style: tallyStyle, name: 'tally', string:''}),
										]
							}),		
							new Line({left:0, right:0, top:0, bottom:0, height:300, skin: lightPinkSkin, name: 'differences'}),
						],
						name: 'main',
});

application.behavior = Object.create(Behavior.prototype, {
							onLaunch: {value: function(app, data) {
											application.invoke(new Message('/getCurrentXKCD'));
											application.add(mainColumn);
											}
									
							}
});