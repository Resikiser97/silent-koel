# Reward / Discord / Referral / Mail Plan

> Status: planning document only. This file records the intended design before implementation.
> Scope: GM redeem code, Discord link reward, referral reward, reward ledger, user mail, GM panel.

---

## 1. Goal

Build one shared reward pipeline for multiple future systems:

- Discord account linking reward
- Referral / referred rewards
- GM redeem codes
- GM developer gifts
- Future treasure chest rewards
- Future compensation mail

The main design rule is:

```text
Feature creates mail or reward transaction
Player claims reward
Backend validates claim
Backend writes reward to cloud data and ledger
Frontend shows reward popup
```

The reward popup is only visual feedback. It must not be the authority that grants rewards.

---

## 2. Current Project Context

Current player identity:

```text
public.chat_users
```

Current cloud save location:

```text
public.chat_users.game_data jsonb
```

`game_data` is currently close to the full localStorage save payload. Mutation points should still be applied to the current game save structure so the game can read them normally.

New permanent reward records should also be written to a separate ledger table so the project can audit rewards and prevent duplicate claims.

---

## 3. Core Concepts

### 3.1 Game Data

`game_data` remains the actual player save data used by the game.

Examples:

```text
mutation points
achievement unlock state
active title / unlocked title data, if currently stored there
```

When a reward grants mutation points, the backend should update `public.chat_users.game_data`.

### 3.2 Reward Ledger

The reward ledger records why a player received something.

It should not replace `game_data`; it is the audit log and anti-duplicate layer.

Example uses:

```text
player already claimed Discord link reward
player already received ispioneer from this source
player received referral reward from a specific referred user
player claimed a specific GM redeem code
player claimed a specific mail
```

### 3.3 Mail

Mail is the player-facing delivery layer.

Recommended flow:

```text
Backend creates mail
Player opens mail
Player clicks claim
Backend grants reward
Backend marks mail claimed
Frontend shows popup
```

Mail should support developer gifts and future treasure chest rewards.

---

## 4. Discord Link Design

### 4.1 OAuth Scope

Use Discord OAuth2 with:

```text
identify
guilds.members.read
```

Reason:

- `identify` gets the Discord user identity.
- `guilds.members.read` lets the backend verify whether the authorized Discord user is a member of the target Discord server.

### 4.2 Required Discord Setup

Create a Discord Developer Application and configure:

```text
client_id
client_secret
redirect_uri
target_guild_id
```

Security rule:

```text
client_secret must never be shipped to frontend code
```

It should live in Supabase Edge Function secrets or another backend-only environment.

### 4.3 Link Flow

```text
1. Player clicks "Link Discord" in game.
2. Frontend asks backend for a Discord OAuth URL.
3. Backend creates a short-lived state value tied to chat_user_id.
4. Frontend redirects player to Discord OAuth.
5. Player authorizes identify + guilds.members.read.
6. Discord redirects back with code + state.
7. Backend validates state.
8. Backend exchanges code for Discord access token.
9. Backend fetches Discord user identity.
10. Backend checks target guild membership.
11. Backend verifies this game account is not already linked.
12. Backend verifies this Discord account is not already linked.
13. Backend creates the Discord link record.
14. Backend creates Pioneer reward mail if not already created or claimed.
15. Frontend returns to game and shows mail / success state.
```

### 4.4 Discord Account Rules

```text
One chat_user_id can link only one Discord account.
One discord_user_id can link only one game account.
Discord link cannot be unlinked by normal player flow.
Discord can later be used to recover a lost game account.
Player must be in the target Discord server to complete verification.
```

Manual admin recovery can exist later, but normal unlinking should not exist because it weakens referral and reward abuse prevention.

### 4.5 Discord Link Reward

On successful Discord verification:

```text
unlock achievement: ispioneer
grant mutation points: +20
```

Rules:

```text
ispioneer is an achievement and title.
If ispioneer is already unlocked, do not unlock it again.
The Discord link +20 mutation points reward can only be claimed once per game account.
The Discord link +20 mutation points reward can only be claimed once per Discord account.
```

Recommended delivery:

```text
Create mail:
title: "來自開發者的禮物"
sender_name: "Goblinnest"
source_type: "discord_link"
reward_payload: { "mutationPoints": 20, "achievements": ["ispioneer"] }
```

Player must click claim in mail before the reward is applied.

---

## 5. Referral Design

### 5.1 Terms

```text
Referrer = A, the player who invites others.
Referred = B, the player who accepts an invite.
```

### 5.2 Referral Eligibility Rules

```text
A can invite many different players.
B can accept referral only once.
B cannot later accept another referral code.
A and B cannot invite each other.
```

Additional project-specific rule:

```text
Before a player gets their own server/referral code:
- they can accept another player's referral code.

After a player gets their own server/referral code:
- they unlock the ability to invite others.
- they can no longer accept another player's referral code.
```

This means becoming an inviter ends the player's "new referred player" eligibility.

### 5.3 Referral Code Creation

A player should receive or unlock their own referral code only after the required condition is met.

Current intended condition:

```text
Player has completed Discord link and server membership verification.
```

This can be adjusted later if the design changes.

### 5.4 Referral Flow

```text
1. B enters A's referral code.
2. Backend checks B has no existing referral.
3. Backend checks B has not created / unlocked their own referral code.
4. Backend checks A and B are different accounts.
5. Backend checks B is not already linked to A through a reverse referral.
6. Backend records pending referral link.
7. B completes Discord link and server membership verification.
8. Backend checks A is also Discord verified and server verified.
9. Backend grants referral rewards once for this A -> B pair.
10. Backend creates claimable mail for A and B, or directly creates mail before claim.
```

### 5.5 Mutual Invite Prevention

When B tries to use A's code, backend must reject if:

```text
There is already a referral where referrer_user_id = B and referred_user_id = A.
```

It must also reject if:

```text
A == B
B already has any referral record as referred_user_id
B already owns/unlocked a referral code
```

### 5.6 Referral Reward

Exact reward amount is not finalized in this planning document.

Known rules:

```text
A can repeatedly receive referral rewards by inviting different valid players.
B can receive referred reward only once.
```

The reward should be delivered through mail and recorded in `reward_transactions`.

---

## 6. GM Redeem Code Design

### 6.1 Redeem Code Types

Support at least two types:

```text
Public code:
- every eligible player can use it once.

Targeted code:
- only specified players can use it.
```

Future optional types:

```text
global limited code
time-limited event code
single-use personal code
```

### 6.2 Redeem Flow

```text
1. Player enters redeem code.
2. Backend normalizes code.
3. Backend checks code exists and is active.
4. Backend checks expiration.
5. Backend checks total usage limit.
6. Backend checks per-user usage limit.
7. Backend checks targeted allowlist if the code is restricted.
8. Backend creates claimable mail or directly claims into mail.
9. Backend records usage and reward transaction after successful claim.
10. Frontend shows mail / claim success / reward popup.
```

Recommended behavior:

```text
Redeem code creates mail.
Player opens mail and clicks claim.
```

This keeps redeem rewards consistent with developer gifts and future chest rewards.

---

## 7. GM Panel Design

The game should have an in-game GM panel for reward management.

### 7.1 GM Permissions

Only trusted GM accounts can open the panel.

Recommended data:

```text
public.chat_users.is_gm
```

or a separate role table:

```text
public.user_roles
```

Do not rely only on frontend hiding. Backend must verify GM permission for every GM action.

### 7.2 GM Panel Features

Initial version:

```text
Create redeem code
Set redeem code active / inactive
Set title
Set mail body
Set sender name
Set reward payload
Set expiration
Set total usage limit
Set per-user usage limit
Choose public or targeted users
Send developer gift mail to a player
```

Later version:

```text
Send mail to all players
Search player by username / Discord ID
View reward ledger for a player
View redeem code claim count
Revoke unclaimed mail
```

---

## 8. Suggested Database Tables

Names are proposed and can be adjusted during implementation.

### 8.1 `public.user_discord_links`

Purpose:

```text
Store permanent game account <-> Discord account binding.
```

Fields:

```text
id uuid primary key
chat_user_id uuid not null references public.chat_users(id)
discord_user_id text not null
discord_username text
discord_global_name text
target_guild_id text not null
guild_joined boolean not null default false
linked_at timestamptz not null default now()
created_at timestamptz not null default now()
```

Constraints:

```text
unique(chat_user_id)
unique(discord_user_id)
```

### 8.2 `public.reward_transactions`

Purpose:

```text
Audit rewards and prevent duplicate claims.
```

Fields:

```text
id uuid primary key
chat_user_id uuid not null references public.chat_users(id)
source_type text not null
source_id text
reward_key text not null
reward_payload jsonb not null
amount integer
created_at timestamptz not null default now()
metadata jsonb
```

Example `source_type` values:

```text
discord_link
referral_referrer
referral_referred
redeem_code
gm_gift
mail_claim
treasure_chest
```

Duplicate prevention examples:

```text
unique(chat_user_id, source_type, source_id, reward_key)
```

For referral referrer rewards, `source_id` should include the referred user's id or referral link id so A can receive rewards for many different players.

### 8.3 `public.user_mail`

Purpose:

```text
Player-facing inbox.
```

Fields:

```text
id uuid primary key
chat_user_id uuid not null references public.chat_users(id)
title text not null
body text not null
sender_name text not null default 'Goblinnest'
reward_payload jsonb
source_type text not null
source_id text
is_read boolean not null default false
is_claimed boolean not null default false
created_at timestamptz not null default now()
claimed_at timestamptz
expires_at timestamptz
metadata jsonb
```

Claim rule:

```text
Only unclaimed and unexpired mail can be claimed.
```

### 8.4 `public.referral_codes`

Purpose:

```text
Store inviter codes.
```

Fields:

```text
id uuid primary key
chat_user_id uuid not null references public.chat_users(id)
code text not null
created_at timestamptz not null default now()
is_active boolean not null default true
```

Constraints:

```text
unique(chat_user_id)
unique(code)
```

### 8.5 `public.referral_links`

Purpose:

```text
Store A -> B referral relationship.
```

Fields:

```text
id uuid primary key
referrer_user_id uuid not null references public.chat_users(id)
referred_user_id uuid not null references public.chat_users(id)
referral_code_id uuid references public.referral_codes(id)
status text not null default 'pending'
created_at timestamptz not null default now()
completed_at timestamptz
rewarded_at timestamptz
metadata jsonb
```

Constraints:

```text
unique(referred_user_id)
check(referrer_user_id <> referred_user_id)
```

Status values:

```text
pending
completed
rewarded
cancelled
```

### 8.6 `public.redeem_codes`

Purpose:

```text
Store GM-created redeem code definitions.
```

Fields:

```text
id uuid primary key
code text not null
title text not null
body text not null
sender_name text not null default 'Goblinnest'
reward_payload jsonb not null
max_total_uses integer
max_uses_per_user integer not null default 1
used_count integer not null default 0
is_active boolean not null default true
created_by uuid references public.chat_users(id)
created_at timestamptz not null default now()
expires_at timestamptz
metadata jsonb
```

Constraints:

```text
unique(code)
```

### 8.7 `public.redeem_code_allowed_users`

Purpose:

```text
Allowlist for targeted redeem codes.
```

Fields:

```text
id uuid primary key
redeem_code_id uuid not null references public.redeem_codes(id)
chat_user_id uuid not null references public.chat_users(id)
created_at timestamptz not null default now()
```

Constraints:

```text
unique(redeem_code_id, chat_user_id)
```

### 8.8 `public.redeem_code_claims`

Purpose:

```text
Record code claims.
```

Fields:

```text
id uuid primary key
redeem_code_id uuid not null references public.redeem_codes(id)
chat_user_id uuid not null references public.chat_users(id)
mail_id uuid references public.user_mail(id)
claimed_at timestamptz not null default now()
metadata jsonb
```

Constraints:

```text
unique(redeem_code_id, chat_user_id)
```

---

## 9. Reward Payload Format

Use a shared JSON format.

Example:

```json
{
  "mutationPoints": 20,
  "achievements": ["ispioneer"],
  "titles": [],
  "items": []
}
```

Rules:

```text
Unknown reward fields should be ignored safely or rejected by backend validation.
Mutation points should be added to game_data.
Achievements should be unlocked only if not already unlocked.
Every applied reward should create reward_transactions rows.
```

---

## 10. Backend Functions

Implementation can use Supabase Edge Functions or equivalent backend endpoints.

Recommended functions:

```text
create_discord_oauth_url
discord_oauth_callback
claim_mail_reward
submit_referral_code
create_referral_code_if_eligible
redeem_code
gm_create_redeem_code
gm_send_mail
```

Backend-only responsibilities:

```text
Discord client secret handling
OAuth state validation
Guild membership verification
GM permission checks
Reward duplicate checks
game_data reward mutation
reward_transactions insertion
mail claimed state transition
```

Frontend responsibilities:

```text
Show buttons and panels
Open Discord OAuth URL
Display mail list and mail details
Call claim endpoint
Show reward popup after backend confirms success
Show GM panel only as convenience, not as security
```

---

## 11. Security Rules

Must-have rules:

```text
Never put Discord client_secret in frontend code.
Never trust frontend reward_payload for claiming.
Never let frontend directly mark rewards as claimed.
Every claim endpoint must verify chat_user_id ownership.
Every GM endpoint must verify GM permission on backend.
Every Discord OAuth callback must verify state.
Every one-time reward must have a unique ledger or claim constraint.
```

Referral abuse prevention:

```text
Reject self-referral.
Reject mutual referral.
Reject referred_user_id if already referred.
Reject accepting referral after owning a referral code.
Require Discord server membership before completing referral reward.
```

Discord binding prevention:

```text
unique(chat_user_id)
unique(discord_user_id)
no normal unlink flow
```

---

## 12. Suggested Implementation Order

### Phase 1: Mail + Reward Ledger

Build:

```text
user_mail table
reward_transactions table
claim_mail_reward backend function
mail UI
reward popup
reward_payload validation
game_data mutation point update
achievement unlock application
```

This phase creates the foundation for every later reward source.

### Phase 2: Discord Link + Pioneer Reward

Build:

```text
Discord OAuth URL function
Discord callback function
user_discord_links table
guild membership check with identify + guilds.members.read
Pioneer reward mail creation
Discord link status UI
```

### Phase 3: Referral

Build:

```text
referral_codes table
referral_links table
submit referral code UI
create own referral code after Discord verification
mutual invite prevention
referrer / referred reward mail creation
```

### Phase 4: GM Redeem Code + GM Panel

Build:

```text
redeem_codes table
redeem_code_allowed_users table
redeem_code_claims table
redeem code input UI
GM panel
GM create code backend function
GM send developer gift backend function
```

---

## 13. Open Decisions

These need confirmation before implementation:

```text
Exact referral reward amount for A / referrer.
Exact referred reward amount for B / referred.
Whether referral reward mail is created immediately when valid or only after both players are Discord verified.
Exact game_data path for mutation points.
Exact game_data path for achievement unlock state, including ispioneer.
Whether GM role is stored on chat_users or a separate role table.
```

---

## 14. Non-Goals For First Implementation

Do not include these in the first version unless explicitly requested:

```text
Player-controlled Discord unlink
Mass mail to all players
Advanced anti-fraud scoring
IP / device fingerprint checks
Full admin audit dashboard
Reward rollback system
```

These can be added later after the basic pipeline is stable.
