
import { door_open, door_close } from "./door"
import { teleporter_activate } from "./teleporter"
import { find_closest_item } from "./util/itemutil"
import { IT_DOOR, IT_TELEPORTER } from "./../item"
import { sound_play } from "./../../core/audio"
import { sprite_get_animation } from "./../../core/sprite"
import { soundfactory_get } from "./../../core/soundfactory"
import { bounding_box } from "./../../core/util"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_image } from "./../actor"

export const switch_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

const init = (item) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_pressed = false;
  me.partner = null;

  actor_change_animation(item.actor, sprite_get_animation("SD_SWITCH", 0));
}

const release = (item) => {
  actor_destroy(item.actor);
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
  let door, teleporter;
  let d1 = {}, d2 = {};

  // I have no partner
  me.partner = null;

  // figuring out who is my partner
  door = find_closest_item(item, item_list, IT_DOOR, d1);
  teleporter = find_closest_item(item, item_list, IT_TELEPORTER, d2);
  if(door != null && d1.dist < d2.dist)
    me.partner = door;
  if(teleporter != null && d2.dist < d1.dist)
    me.partner = teleporter;

  // handle the logic. Which logic? That depends. Who is my partner, if any?
  if(me.partner == null)
    handle_logic(item, door, team, team_size, stepin_nothing, stepout_nothing);
  else if(me.partner == door)
    handle_logic(item, door, team, team_size, stepin_door, stepout_door);
  else if(me.partner == teleporter)
    handle_logic(item, teleporter, team, team_size, stepin_teleporter, stepout_teleporter);
}

const render = (item, camera_position) => {

  let me = item;

  /*if(level.editmode() && me.partner != null) {
    var p1, p2, offset;
    offset = v2d.subtract(camera.position, v2d.new_v2d(video.VIDEO_SCREEN_W/2, video.VIDEO_SCREEN_H/2));
    p1 = v2d.subtract(item.actor.position, offset);
    p2 = v2d.subtract(me.partner.actor.position, offset);
    image.line(video.get_backbuffer(), parseInt(p1.x,10), parseInt(p1.y,10), parseInt(p2.x,10), parseInt(p2.y,10), image.rgb(255, 0, 0));
  }*/

  actor_render(item.actor, camera_position);
}

const handle_logic = (item, other, team, team_size, stepin, stepout) => {
  let i;
  let nobody_is_pressing_me = true;
  let me = item;
  let act = item.actor;

  // step in
  for(i=0; i<team_size; i++) {
    let player = team[i];

    if(pressed_the_switch(item, player)) {
      nobody_is_pressing_me = false;
      if(!me.is_pressed) {
        stepin(other, player);
        sound_play( soundfactory_get("switch") );
        actor_change_animation(act, sprite_get_animation("SD_SWITCH", 1));
        me.is_pressed = true;
      }
    }
  }

  // step out
  if(nobody_is_pressing_me) {
    if(me.is_pressed) {
      stepout(other);
      actor_change_animation(act, sprite_get_animation("SD_SWITCH", 0));
      me.is_pressed = false;
    }
  }
}

const stepin_nothing = (door, who) => {}

const stepout_nothing = (door) => {}

const stepin_door = (door, who) => {
  door_open(door);
}

const stepout_door = (door) => {
  door_close(door);
}

const stepin_teleporter = (teleporter, who) => {
  teleporter_activate(teleporter, who);
}

const stepout_teleporter = (teleporter) => {}

/* returns true if the player has pressed the switch (item) */
const pressed_the_switch = (item, player) => {
  if (!item) return false;
  if (!player) return false;

  let a = [];
  let b = [];

  a[0] = item.actor.position.x - item.actor.hot_spot.x;
  a[1] = item.actor.position.y - item.actor.hot_spot.y;
  a[2] = a[0] + actor_image(item.actor).width;
  a[3] = a[1] + actor_image(item.actor).height;

  b[0] = player.actor.position.x - player.actor.hot_spot.x + actor_image(player.actor).width * 0.3;
  b[1] = player.actor.position.y - player.actor.hot_spot.y + actor_image(player.actor).height * 0.5;
  b[2] = b[0] + actor_image(player.actor).width * 0.4;
  b[3] = b[1] + actor_image(player.actor).height * 0.5;

  return (!player.dying && !player.climbing && !player.flying && bounding_box(a,b));
}


