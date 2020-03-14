const express 	= require('express');
const fs 		= require('fs');
const uuidv4 	= require('uuid/v4');
let app 		= express();

//app.use(express.static("public"));
app.use(express.json({extended: true}));


app.get('/questions', getQuestions);
app.post('/sessions', createSession);
app.get('/sessions', getSession);
app.delete("/sessions/:uuid", deleteSession);


function getQuestions(req, res, next){

	let obj = {
		status : '0',
		results: []
	}

	if(req.query.token == null){

		if(!req.query.limit){
			req.query.limit = 10;
		}
		else {
			req.query.limit = Number(req.query.limit);

			if(isNaN(req.query.limit)){
				obj.status = 1;
				res.status(200).send(JSON.stringify(obj));
				return;
			 }
		}

		let limit = req.query.limit;

		let difficulty = null;

		if(!req.query.difficulty){
			req.query.difficulty = null;
		}
		else {
			req.query.difficulty = Number(req.query.difficulty);
			if(isNaN(req.query.difficulty)){
				obj.status = 1;
				res.status(200).send(JSON.stringify(obj));
				return;
			 }
		}

		if((req.query.difficulty < 4) && (req.query.difficulty > 0)){
			difficulty = req.query.difficulty ;

		}
		let category = null;

		if(!req.query.category){
			req.query.category = null;
		}
		else {
			req.query.category = Number(req.query.category);

			if(isNaN(req.query.category)){
				obj.status = 1;
				res.status(200).send(JSON.stringify(obj));
				return;
			 }
		}

		if((req.query.category < 25) && (req.query.category > 0)){
			category = req.query.category ;
		}

		let file_names = fs.readdirSync('./questions');

		if(limit > file_names.length){
			obj.status = 1;
			res.status(200).send(JSON.stringify(obj));
			return;

		}
		let shuffled_questions = shuffle(file_names);
		let counter = 0;

		shuffled_questions.forEach (item =>{
			if(counter === limit){
				return;
			}
			let file_read 	= fs.readFileSync('./questions/'+item);
			let q_obj 		= JSON.parse(file_read);

			if(!(category == null) || !(difficulty == null)){

				if(!(category == null) && !(difficulty == null)){
					let checker = 0;
					if(q_obj.category_id == category){
						checker++;
					}
					if(q_obj.difficulty_id == difficulty){
						checker++
					}
					if(checker == 2){
						obj.results.push(q_obj);
						counter++;
					}
				}

				else if(!(category == null)){
					if(q_obj.category_id == category){
						obj.results.push(q_obj);
						counter++;
					}
				}
				else if(!(difficulty == null)){
					if(q_obj.difficulty_id == difficulty){
						obj.results.push(q_obj);
						counter++;
					}
				}
			}
			else{
				obj.results.push(q_obj);
				counter++;
			}

		});
		if(obj.results.length < limit){
			obj.status = 1;
			obj.results = [];
			res.status(200).send(JSON.stringify(obj));
			return;
		}
		res.send(JSON.stringify(obj));
		return;
	}

	else if (!(req.query.token == null)){


		let id = req.query.token + '.json';

		let session_files = fs.readdirSync('./sessions');
		let bool = false;
		session_files.forEach(item => {
			if(id == item){
				bool = true;
			}
		})
		if(bool == false){
			obj.status = 2;
			res.status(404).send(JSON.stringify(obj));
			return;
		}

		let session_read = fs.readFileSync('./sessions/'+ id);
		let session_obj = JSON.parse(session_read);

		if(session_obj.questions.length == 0){
			if(!req.query.limit){
				req.query.limit = 10;
			}
			else {
				req.query.limit = Number(req.query.limit);

				if(isNaN(req.query.limit)){
					obj.status = 1;
					res.status(200).send(JSON.stringify(obj));
					return;
				 }
			}

			let limit = req.query.limit;

			let difficulty = null;

			if(!req.query.difficulty){
				req.query.difficulty = null;
			}
			else {
				req.query.difficulty = Number(req.query.difficulty);
				if(isNaN(req.query.difficulty)){
					obj.status = 1;
					res.status(200).send(JSON.stringify(obj));
					return;
				 }
			}
			if((req.query.difficulty < 4) && (req.query.difficulty > 0)){
				difficulty = req.query.difficulty ;

			}
			let category = null;

			if(!req.query.category){
				req.query.category = null;
			}
			else {
				req.query.category = Number(req.query.category);

				if(isNaN(req.query.category)){
					obj.status = 1;
					res.status(200).send(JSON.stringify(obj));
					return;
				 }
			}

			//checking the difficulty
			if((req.query.category < 25) && (req.query.category > 0)){
				category = req.query.category ;
			}

			let file_names = fs.readdirSync('./questions');

			if(limit > file_names.length){
				obj.status = 1;
				res.status(200).send(JSON.stringify(obj));
				return;

			}
			let shuffled_questions = shuffle(file_names);

			let counter = 0;
			shuffled_questions.forEach (item =>{
				if(counter === limit){
					return;
				}
				let file_read 	= fs.readFileSync('./questions/'+item);
				let q_obj 		= JSON.parse(file_read);

				if(!(category == null) || !(difficulty == null)){

					if(!(category == null) && !(difficulty == null)){
						let checker = 0;
						if(q_obj.category_id == category){
							checker++;
						}
						if(q_obj.difficulty_id == difficulty){
							checker++
						}
						if(checker == 2){
							session_obj.questions.push(q_obj);
							obj.results.push(q_obj);
							counter++;
						}
					}
					else if(!(category == null)){
						if(q_obj.category_id == category){
							session_obj.questions.push(q_obj);
							obj.results.push(q_obj);
							counter++;
						}
					}
					else if(!(difficulty == null)){
						if(q_obj.difficulty_id == difficulty){
							session_obj.questions.push(q_obj);
							obj.results.push(q_obj);
							counter++;
						}
					}
				}
				else{
					obj.results.push(q_obj);
					session_obj.questions.push(q_obj);
					counter++;
				}

			})
			if(obj.results.length < limit){
				obj.status = 1;
				obj.results = [];
				res.status(200).send(JSON.stringify(obj));
				return;
			}
			res.send(JSON.stringify(obj));
			fs.writeFileSync('./sessions/' + id , JSON.stringify(session_obj));
			return;
		}
		//IF the session has some questions
		else{

			if(!req.query.limit){
				req.query.limit = 10;
			}
			else {
				req.query.limit = Number(req.query.limit);

				if(isNaN(req.query.limit)){
					obj.status = 1;
					res.status(200).send(JSON.stringify(obj));
					return;
				 }
			}

			let limit = req.query.limit;

			let difficulty = null;

			if(!req.query.difficulty){
				req.query.difficulty = null;
			}
			else {
				req.query.difficulty = Number(req.query.difficulty);

				if(isNaN(req.query.difficulty)){
					obj.status = 1;
					res.status(200).send(JSON.stringify(obj));
					return;
				 }
			}


			//checking the difficulty
			if((req.query.difficulty < 4) && (req.query.difficulty > 0)){
				difficulty = req.query.difficulty ;

			}
			let category = null;

			if(!req.query.category){
				req.query.category = null;
			}
			else {
				req.query.category = Number(req.query.category);

				if(isNaN(req.query.category)){
					obj.status = 1;
					res.status(200).send(JSON.stringify(obj));
					return;
				 }
			}

			//checking the difficulty
			if((req.query.category < 25) && (req.query.category > 0)){
				category = req.query.category ;
			}

			let file_names 			= fs.readdirSync('./questions');
			if(limit > file_names.length){
				obj.status = 1;
				res.status(200).send(JSON.stringify(obj));
				return;

			}
			let q_chck = 0;

			//At this point we check whther the user is able to the get the desired number of questions
			//length of questions array in session
			let length_of_questions = session_obj.questions.length;

			//total number of questions
			let length_of_filenames = file_names.length;
			//number of questions that can be provided
			let remainder 			= length_of_filenames - length_of_questions

			if(limit < remainder){
				q_chck++;
			}
			else{
				obj.status = 1;
				res.status(200).send(JSON.stringify(obj));
				return;
			}
			//Now we iterate through the questions and count the number of questions that match
			//our category and difficulty
			let cat_counter = 0;
			let dif_counter = 0;
			file_names.forEach( question =>{

				let file_read 	= fs.readFileSync('./questions/'+question);
				let q_obj 		= JSON.parse(file_read);

				if(!(category == null)){
					if(q_obj.category_id == category){
						cat_counter++;
					}
				}
				if(!(difficulty == null)){
					if(q_obj.difficulty_id == difficulty){
						dif_counter++;
					}
				}

			});

			//At this point, we  have counted the TOTAL number of cat ids and dif ids that are provided to us
			//Now we will iterate through our session questions and count the number of cat ids and diff includes

			let session_cat_count = 0; //desired category that we already have
			let session_dif_count = 0; //desired difficulty that we already have

			session_obj.questions.forEach(question =>{

				if(!(category == null)){
					if(question.category_id == category){
						session_cat_count++;
					}
				}
				if(!(difficulty == null)){
					if(question.difficulty_id == difficulty){
						session_dif_count++;
					}
				}
			});

			let r = cat_counter - session_cat_count;

			if(r <= 0 && !(category == null)){
				obj.status = 1;
				res.status(200).send(JSON.stringify(obj));
				return;
			}
			let p = dif_counter - session_dif_count;

			if(p <= 0 && !(difficulty == null)){
				obj.status = 1;
				res.status(200).send(JSON.stringify(obj));
				return;
			}

			let shuffled_questions = shuffle(file_names);

			let counter = 0;
			shuffled_questions.forEach (item =>{
				if(counter === limit){
					return;
				}
				let file_read 	= fs.readFileSync('./questions/'+item);
				let q_obj 		= JSON.parse(file_read);

				let flag = false;

				for(let i = 0; i < session_obj.questions.length; i++ ){
					if(session_obj.questions[i].question_id == q_obj.question_id){
						flag = true; //the question has already been added

					}
				}

				if(flag == false){
					if(!(category == null) || !(difficulty == null)){

						if(!(category == null) && !(difficulty == null)){
							let checker = 0;
							if(q_obj.category_id == category){
								checker++;
							}
							if(q_obj.difficulty_id == difficulty){
								checker++
							}
							if(checker == 2){
								session_obj.questions.push(q_obj);
								obj.results.push(q_obj);
								counter++;
							}
						}
						else if(!(category == null)){
							if(q_obj.category_id == category){
								session_obj.questions.push(q_obj);
								obj.results.push(q_obj);
								counter++;
							}
						}
						else if(!(difficulty == null)){
							if(q_obj.difficulty_id == difficulty){
								session_obj.questions.push(q_obj);
								obj.results.push(q_obj);
								counter++;
							}
						}
					}
					else{
						obj.results.push(q_obj);
						session_obj.questions.push(q_obj);
						counter++;
					}

				}



			})

			if(obj.results.length == 0){
				obj.status = 1;
				obj.results = [];
				res.status(200).send(JSON.stringify(obj));
				return;
			}

			res.send(JSON.stringify(obj));
			fs.writeFileSync('./sessions/' + id , JSON.stringify(session_obj));
			return;

		}

	}

}

function createSession(req, res, next){

	//creating random
	let rand_id = uuidv4();
	let obj 	= {
		id: 		rand_id,
		questions:	[]
	}

	//writing to a file
	fs.writeFileSync('./sessions/' + rand_id + '.json', JSON.stringify(obj));

	res.body = rand_id;
	res.status(201).send(JSON.stringify(res.body));

}

function getSession(req, res, next){

	let file_names = fs.readdirSync('./sessions');

	res.body = file_names;
	res.status(200).send(JSON.stringify(res.body));

}

function deleteSession(req, res, next){

	let unique_id = req.params.uuid + '.json';
	let file_names = fs.readdirSync('./sessions');

	let flag = 0;
	file_names.forEach( item => {

		if(unique_id == item){
			fs.unlinkSync('./sessions/' + item, 'utf8');
			flag += 1;

		}

	});

	if(flag == 1){
		res.status(200).send("Session " + unique_id + " was deleted successfully!");
	}
	else{
		res.status(404).send("Session " + unique_id + " was NOT FOUND!");

	}


}

app.listen(3000);
console.log("Server listening at http://localhost:3000");


var shuffle = function (array) {

	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;

};
