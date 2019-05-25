/* eslint-disable prefer-spread */
import { use } from '../utils';
import { emit, inherit } from '../utils/functional';
import { preventDefault } from '../utils/event';
import Icon from '../icon';

// Types
import { CreateElement, RenderContext } from 'vue/types';
import { DefaultSlots } from '../utils/types';

const [sfc, bem] = use('rate');

export type RateProps = {
  size: number;
  icon: string;
  count: number;
  color: string;
  value: number;
  voidIcon: string;
  voidColor: string;
  readonly?: boolean;
  disabled?: boolean;
  allowHalf?: boolean;
  disabledColor: string;
};

export type RateEvents = {
  input(index: number): void;
  change(index: number): void;
};

type RateStatus = 'full' | 'half' | 'void';

function getRateStatus(value: number, index: number, allowHalf?: boolean): RateStatus {
  if (value >= index) {
    return 'full';
  }
  if (value + 0.5 >= index && allowHalf) {
    return 'half';
  }
  return 'void';
}

function Rate(
  h: CreateElement,
  props: RateProps,
  slots: DefaultSlots,
  ctx: RenderContext<RateProps>
) {
  const {
    icon,
    size,
    color,
    voidIcon,
    readonly,
    disabled,
    voidColor,
    disabledColor
  } = props;

  const list: RateStatus[] = [];
  for (let i = 1; i <= props.count; i++) {
    list.push(getRateStatus(props.value, i, props.allowHalf));
  }

  function onSelect(index: number) {
    if (!disabled && !readonly) {
      emit(ctx, 'input', index);
      emit(ctx, 'change', index);
    }
  }

  function onTouchMove(event: TouchEvent) {
    if (readonly || disabled || !document.elementFromPoint) {
      return;
    }

    preventDefault(event);
    const { clientX, clientY } = event.touches[0];
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement;

    if (target && target.dataset) {
      const { score } = target.dataset;

      /* istanbul ignore else */
      if (score) {
        onSelect(+score);
      }
    }
  }

  function renderStar(status: RateStatus, index: number) {
    const isFull = status === 'full';
    const isVoid = status === 'void';
    const score = index + 1;

    return (
      <div
        key={index}
        role="radio"
        tabindex="0"
        aria-posinset={score}
        aria-setsize={props.count}
        aria-checked={String(!isVoid)}
        class={bem('item')}
      >
        <Icon
          name={isFull ? icon : voidIcon}
          size={`${size}px`}
          class={bem('icon')}
          data-score={score}
          color={disabled ? disabledColor : isFull ? color : voidColor}
          onClick={() => {
            onSelect(score);
          }}
        />
        {props.allowHalf && (
          <Icon
            name={isVoid ? voidIcon : icon}
            size={`${size}px`}
            class={bem('icon', 'half')}
            data-score={score - 0.5}
            color={disabled ? disabledColor : isVoid ? voidColor : color}
            onClick={() => {
              onSelect(score - 0.5);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      class={bem()}
      tabindex="0"
      role="radiogroup"
      {...inherit(ctx)}
      onTouchmove={onTouchMove}
    >
      {list.map((status, index) => renderStar(status, index))}
    </div>
  );
}

Rate.props = {
  value: Number,
  readonly: Boolean,
  disabled: Boolean,
  allowHalf: Boolean,
  size: {
    type: Number,
    default: 20
  },
  icon: {
    type: String,
    default: 'star'
  },
  voidIcon: {
    type: String,
    default: 'star-o'
  },
  color: {
    type: String,
    default: '#ffd21e'
  },
  voidColor: {
    type: String,
    default: '#c7c7c7'
  },
  disabledColor: {
    type: String,
    default: '#bdbdbd'
  },
  count: {
    type: Number,
    default: 5
  }
};

export default sfc<RateProps, RateEvents>(Rate);
