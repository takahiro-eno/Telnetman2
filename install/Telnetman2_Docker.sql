DROP DATABASE IF EXISTS Telnetman2;

create database Telnetman2;
use Telnetman2;

DROP TABLE IF EXISTS T_User;
DROP TABLE IF EXISTS T_Group;
DROP TABLE IF EXISTS T_UserGroup;
DROP TABLE IF EXISTS T_GroupUser;
DROP TABLE IF EXISTS T_LoginList;
DROP TABLE IF EXISTS T_SessionList;
DROP TABLE IF EXISTS T_LockedAccount;
DROP TABLE IF EXISTS T_Script;
DROP TABLE IF EXISTS T_Command;
DROP TABLE IF EXISTS T_Action;
DROP TABLE IF EXISTS T_Ping;
DROP TABLE IF EXISTS T_Search;
DROP TABLE IF EXISTS T_Queue;
DROP TABLE IF EXISTS T_ChildProcess;
DROP TABLE IF EXISTS T_SessionStatus;
DROP TABLE IF EXISTS T_NodeStatus;
DROP TABLE IF EXISTS T_Archive;

create table T_User(
 vcUserId varchar(64) not null primary key,
 vcUserPassword varchar(64),
 vcUserName varchar(64),
 vcUserMailAddress varchar(64),
 iMaxSessionNumber int unsigned,
 iEffective tinyint unsigned,
 iUserRegistrationTime int unsigned,
 iUserLastActivationTime int unsigned
);

create table T_Group (
 vcGroupId varchar(64) not null primary key,
 vcGroupName varchar(64),
 iCreateTime int unsigned,
 iUpdateTime int unsigned
);

create table T_UserGroup (
 vcUserId varchar(64) not null,
 vcGroupId varchar(64) not null
);
alter table T_UserGroup add index IDX_UserGroup (vcUserId); 

create table T_GroupUser (
 vcGroupId varchar(64) not null,
 vcUserId varchar(64) not null
);
alter table T_GroupUser add index IDX_GroupUser (vcGroupId); 

create table T_LoginList(
 vcLoginId varchar(128) not null primary key,
 vcUserId varchar(64),
 iLastAccessTime int unsigned
);

create table T_SessionList(
 vcUserId varchar(64) not null,
 vcSessionId varchar(128),
 iCreateTime int unsigned,
 iLastAccessTime int unsigned
);
alter table T_SessionList add index IDX_SessionList (vcUserId);

create table T_LockedAccount(
 vcLockingId varchar(128) not null primary key,
 vcUserId varchar(64)
);

create table T_Script(
 vcScriptId varchar(128) not null primary key,
 iCreateTime int unsigned,
 iUpdateTime int unsigned,
 vcUserId varchar(64),
 vcChanger varchar(64)
);

create table T_Command(
 vcCommandId varchar(128) not null primary key,
 vcKeyword varchar(128),
 iCreateTime int unsigned,
 iUpdateTime int unsigned,
 vcUserId varchar(64),
 vcChanger varchar(64),
 vcTitle varchar(128) not null,
 iRepeatType tinyint unsigned,
 vcComment varchar(512),
 iWaitTime int unsigned,
 iConftEnd tinyint unsigned,
 txCommand text not null,
 iCommandType tinyint unsigned,
 txDummyReturn text,
 vcParticularPrompt varchar(128),
 iPromptChecker tinyint unsigned,
 iStore tinyint unsigned
);

create table T_Action (
 vcActionId varchar(128) not null primary key,
 vcKeyword varchar(128),
 iCreateTime int unsigned,
 iUpdateTime int unsigned,
 vcUserId varchar(64),
 vcChanger varchar(64),
 vcTitle varchar(128) not null,
 iRepeatType tinyint unsigned,
 vcComment varchar(512),
 vcBeginWord varchar(128),
 iPipeType tinyint unsigned,
 vcPipeWord varchar(1024),
 vcEndWord varchar(128),
 vcPattern varchar(2048),
 vcScriptId varchar(128),
 txConditions text,
 iNot tinyint unsigned,
 iOperator tinyint unsigned,
 iCount int unsigned,
 vcNgMessage varchar(512),
 txParameterSheetA text,
 txParameterSheetB text,
 iDestroy tinyint unsigned
);

create table T_Ping (
 vcPingId varchar(128) not null primary key,
 vcKeyword varchar(128),
 iCreateTime int unsigned,
 iUpdateTime int unsigned,
 vcUserId varchar(64),
 vcChanger varchar(64),
 vcTitle varchar(128) not null,
 iRepeatType tinyint unsigned,
 vcComment varchar(512),
 txTarget text,
 iCount int unsigned,
 iTimeout int unsigned,
 iCondition tinyint unsigned,
 vcNgMessage varchar(512)
);

create table T_Search (
 vcKeyword varchar(128) not null,
 vcItemType varchar(32) not null,
 vcItemId varchar(128) not null,
 vcTitle varchar(128) not null
);
alter table T_Search add index IDX_Search (vcKeyword);

create table T_Queue(
 vcSessionId varchar(128) not null primary key,
 iQueueIndex int unsigned
);

create table T_ChildProcess(
 iChildProcessIndex int unsigned not null primary key auto_increment,
 iChildProcessStatus tinyint unsigned,
 iCountOfNode int unsigned,
 iExpectedTime int unsigned,
 iStartTime int unsigned
);

insert into T_ChildProcess (iChildProcessStatus,iCountOfNode,iExpectedTime,iStartTime) values (0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0);

create table T_SessionStatus(
 vcSessionId varchar(128) not null primary key,
 iCreateTime int unsigned,
 iUpdateTime int unsigned,
 vcTitle varchar(64),
 vcUserId varchar(64),
 iSessionStatus tinyint unsigned,
 iAutoPause tinyint unsigned,
 iTotalTime int unsigned,
 iTotalNumber int unsigned
);

create table T_NodeStatus(
 vcSessionId varchar(128) not null,
 iCreateTime int unsigned,
 iUpdateTime int unsigned,
 iNodeStatus tinyint unsigned not null,
 iNodeIndex int unsigned,
 vcIpAddress varchar(64)
);
alter table T_NodeStatus add index IDX_NodeStatus (vcSessionId,iNodeStatus);

create table T_Archive(
 iYyyyMmDd int unsigned not null,
 vcUserId varchar(64) not null,
 vcSessionId varchar(128),
 vcTitle varchar(64),
 iPushedTime int unsigned
);
alter table T_Archive add index IDX_Archive (iYyyyMmDd, vcUserId);
