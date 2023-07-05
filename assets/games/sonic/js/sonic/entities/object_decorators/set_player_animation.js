
import { get_object_instance } from "./base/objectdecorator"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_change_animation } from "./../actor"
import { enemy_get_observed_player } from "./../enemy"

export const setplayeranimation_new = (decorated_machine, sprite_name, animation_id) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.anim = sprite_get_animation(sprite_name, animation_id);

  return obj;
}

const init = (obj) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.init(decorated_machine);
}

const release = (obj) => {
  //let dec = obj;
  //let decorated_machine = dec.decorated_machine;
  //decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj, team, team_size, brick_list, item_list, object_list) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;
  let me = obj;
  let player = enemy_get_observed_player(obj.get_object_instance(obj));

  actor_change_animation(player.actor, me.anim);    

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  var dec = obj;
  var decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}
