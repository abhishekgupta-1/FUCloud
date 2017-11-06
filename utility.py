import random

# global variables
currentTerm = 0
state = 'f'
votedFor = None
lastKnownLeaderID = None
commitIndex = 0
maybeNeedToCommit = False
lastApplied = 0
nextIndex = {}
matchIndex = {}
recoveryMode = False
recoveryPrevLogIndex = 0
grantedVotes = 0
election = random.randint(150, 300)
heartbeatTime = 100
commitTime = 500
shift = False
shiftHeart = False
electionTimeCall = False
heartbeatTimeCall = False

def writeToPersistentStore():
	global currentTerm, votedFor, log
	dic = {"currentTerm": currentTerm, "votedFor": votedFor, "log": log }
	with open("checkpoint.pkl", "wb") as outFile:
		pickle.dump(dic, outFile, pickle.HIGHEST_PROTOCOL)
		# pickle.dump(log, outFile, pickle.HIGHEST_PROTOCOL)

def readFromPersistentStore():
	global currentTerm, votedFor, log
	with open("checkpoint.pkl", "rb") as inFile:
		newDic = pickle.load(inFile)
		currentTerm = newDic['currentTerm']
		votedFor = newDic['votedFor']
		log = newDic['log']

def write_to_file(msg):
	if msg is not None:
		with open(msg['fileName'], "a") as myfile:
		    myfile.write("%s"%(msg['data']))

def readFile(requestId, clientId, filename):
	with open(filename, "rU") as myfile:
		for line in f:
			print line
