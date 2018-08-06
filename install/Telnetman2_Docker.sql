create database if not exists Telnetman2;
use Telnetman2;

create table if not exists T_User(
 vcUserId varchar(64) not null primary key,
 vcUserPassword varchar(64),
 vcUserName varchar(64),
 vcUserMailAddress varchar(64),
 iMaxSessionNumber int unsigned,
 iEffective tinyint unsigned,
 iUserRegistrationTime int unsigned,
 iUserLastActivationTime int unsigned
);

create table if not exists T_Group (
 vcGroupId varchar(64) not null primary key,
 vcGroupName varchar(64),
 iCreateTime int unsigned,
 iUpdateTime int unsigned
);

create table if not exists T_UserGroup (
 vcUserId varchar(64) not null,
 vcGroupId varchar(64) not null
);

set @x := (select count(*) from information_schema.statistics where table_name = 'T_UserGroup' and index_name = 'IDX_UserGroup' and table_schema = database());
set @sql := if( @x > 0, 'select ''Index exists.''', 'Alter Table T_UserGroup ADD Index IDX_UserGroup (vcUserId);');
PREPARE stmt FROM @sql;
EXECUTE stmt;


create table if not exists T_GroupUser (
 vcGroupId varchar(64) not null,
 vcUserId varchar(64) not null
);

set @x := (select count(*) from information_schema.statistics where table_name = 'T_GroupUser' and index_name = 'IDX_GroupUser' and table_schema = database());
set @sql := if( @x > 0, 'select ''Index exists.''', 'Alter Table T_GroupUser ADD Index IDX_GroupUser (vcGroupId);');
PREPARE stmt FROM @sql;
EXECUTE stmt;


create table if not exists T_LoginList(
 vcLoginId varchar(128) not null primary key,
 vcUserId varchar(64),
 iLastAccessTime int unsigned
);

create table if not exists T_SessionList(
 vcUserId varchar(64) not null,
 vcSessionId varchar(128),
 iCreateTime int unsigned,
 iLastAccessTime int unsigned
);

set @x := (select count(*) from information_schema.statistics where table_name = 'T_SessionList' and index_name = 'IDX_SessionList' and table_schema = database());
set @sql := if( @x > 0, 'select ''Index exists.''', 'Alter Table T_SessionList ADD Index IDX_SessionList (vcUserId);');
PREPARE stmt FROM @sql;
EXECUTE stmt;


create table if not exists T_LockedAccount(
 vcLockingId varchar(128) not null primary key,
 vcUserId varchar(64)
);

create table if not exists T_Script(
 vcScriptId varchar(128) not null primary key,
 iCreateTime int unsigned,
 iUpdateTime int unsigned,
 vcUserId varchar(64),
 vcChanger varchar(64)
);

create table if not exists T_Command(
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

create table if not exists T_Action (
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

create table if not exists T_Ping (
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

create table if not exists T_Search (
 vcKeyword varchar(128) not null,
 vcItemType varchar(32) not null,
 vcItemId varchar(128) not null,
 vcTitle varchar(128) not null
);

set @x := (select count(*) from information_schema.statistics where table_name = 'T_Search' and index_name = 'IDX_Search' and table_schema = database());
set @sql := if( @x > 0, 'select ''Index exists.''', 'Alter Table T_Search ADD Index IDX_Search (vcKeyword);');
PREPARE stmt FROM @sql;
EXECUTE stmt;


create table if not exists T_Queue(
 vcSessionId varchar(128) not null primary key,
 iQueueIndex int unsigned
);

create table if not exists T_ChildProcess(
 iChildProcessIndex int unsigned not null primary key auto_increment,
 iChildProcessStatus tinyint unsigned,
 iCountOfNode int unsigned,
 iExpectedTime int unsigned,
 iStartTime int unsigned
);

set @x := (select count(*) from T_ChildProcess);
set @sql := if( @x > 0, 'select count(*) from T_ChildProcess', 'insert into T_ChildProcess (iChildProcessStatus,iCountOfNode,iExpectedTime,iStartTime) values (0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0)');
PREPARE stmt FROM @sql;
EXECUTE stmt;


create table if not exists T_SessionStatus(
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

create table if not exists T_NodeStatus(
 vcSessionId varchar(128) not null,
 iCreateTime int unsigned,
 iUpdateTime int unsigned,
 iNodeStatus tinyint unsigned not null,
 iNodeIndex int unsigned,
 vcIpAddress varchar(64)
);

set @x := (select count(*) from information_schema.statistics where table_name = 'T_NodeStatus' and index_name = 'IDX_NodeStatus' and table_schema = database());
set @sql := if( @x > 0, 'select ''Index exists.''', 'Alter Table T_NodeStatus ADD Index IDX_NodeStatus (vcSessionId,iNodeStatus);');
PREPARE stmt FROM @sql;
EXECUTE stmt;


create table if not exists T_Archive(
 iYyyyMmDd int unsigned not null,
 vcUserId varchar(64) not null,
 vcSessionId varchar(128),
 vcTitle varchar(64),
 iPushedTime int unsigned
);

set @x := (select count(*) from information_schema.statistics where table_name = 'T_Archive' and index_name = 'IDX_Archive' and table_schema = database());
set @sql := if( @x > 0, 'select ''Index exists.''', 'Alter Table T_Archive ADD Index IDX_Archive (iYyyyMmDd, vcUserId);');
PREPARE stmt FROM @sql;
EXECUTE stmt;
