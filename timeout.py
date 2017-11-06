def electionTimeout():
	global currentTerm, electionTimeCall, state, votedFor, grantedVotes, clusterMember, lastKnownLeaderID, log
	global server_id, shift, election
	if electionTimeCall == True:
		if lastKnownLeaderID == None:
			print("No known leader for me, starting election!")
		else:
			print("No heartbeat received from leader, starting new election!")
		currentTerm += 1
		state = 'c'
		votedFor = server_id
		grantedVotes = 1
		msg = {'rpc':'requestVote'
		, 'term':currentTerm
		, 'candidateId':server_id
		, 'lastLogIndex':log._length-1
		, 'lastLogTerm':log._entries[-1]._term};
		for destid in clusterMembers:
			if destid != server_id:
				sendMessage(destid, msg)
	if shift:
		electionTimeCall = True
		shift = False
	threading.Timer(election/1000.0, electionTimeout).start()


def heartbeatTimeout():
	global heartbeatTimeCall, shift, currentTerm, server_id, shiftHeart, heartbeatTime
	global electionTimeCall, state, votedFor, grantedVotes, clusterMember, lastKnownLeaderID, log
	if heartbeatTimeCall == True:
		msg = {'rpc':'appendEntries'
		, 'term':currentTerm
		, 'leaderId': server_id
		, 'prevLogIndex':log._length-1
		, 'prevLogTerm':log._entries[-1]._term
		, 'entries' : []
		, 'leaderCommit':commitIndex};
		for destid in clusterMembers:
			if destid != server_id:
				sendMessage(destid, msg)
		electionTimeCall = False
		shift = False
	if shiftHeart == True:
		heartbeatTimeCall = True
		shiftHeart = False
	threading.Timer(heartbeatTime/1000.0, heartbeatTimeout).start()
