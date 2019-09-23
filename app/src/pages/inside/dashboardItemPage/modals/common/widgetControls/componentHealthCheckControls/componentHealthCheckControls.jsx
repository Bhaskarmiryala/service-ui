import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import { validate } from 'common/utils';
import { URLS } from 'common/urls';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { FieldProvider } from 'components/fields/fieldProvider';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { activeProjectSelector } from 'controllers/user';
import { getWidgetModeOptions } from '../utils/getWidgetModeOptions';
import {
  FiltersControl,
  InputControl,
  AttributesFieldArrayControl,
  TogglerControl,
} from '../controls';
import { ITEMS_INPUT_WIDTH } from '../constants';
import styles from '../widgetControls.scss';

const cx = classNames.bind(styles);

const MAX_ATTRIBUTES_AMOUNT = 10;
const DEFAULT_ITEMS_COUNT = '100';

const messages = defineMessages({
  passingRateFieldLabel: {
    id: 'CumulativeTrendControls.PassingRateFieldLabel',
    defaultMessage: 'The min allowable passing rate for the component',
  },
  componentTitle: {
    id: 'CumulativeTrendControls.ComponentTitle',
    defaultMessage: 'Component',
  },
  passingRateValidationError: {
    id: 'CumulativeTrendControls.PassingRateValidationError',
    defaultMessage: 'Should have value from 50 to 100',
  },
  attributeKeyValidationError: {
    id: 'CumulativeTrendControls.attributeKeyValidationError',
    defaultMessage: 'Value should have size from 1 to 128',
  },
  attributesArrayValidationError: {
    id: 'CumulativeTrendControls.attributesArrayValidationError',
    defaultMessage:
      'Enter an attribute key whose unique value will be used for combine tests into groups',
  },
});
const validators = {
  passingRate: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 50, 100)) &&
    formatMessage(messages.passingRateValidationError),
  attributeKey: (formatMessage) => (value) => {
    if (!value) {
      return formatMessage(messages.attributesArrayValidationError);
    } else if (!validate.attributeKey(value)) {
      return formatMessage(messages.attributeKeyValidationError);
    }
    return undefined;
  },
};

@connect((state) => ({
  itemAttributeKeysAllSearch: URLS.itemAttributeKeysAllSearch(activeProjectSelector(state)),
}))
@injectIntl
export class ComponentHealthCheckControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    itemAttributeKeysAllSearch: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeControlsForm } = props;

    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_ITEMS_COUNT,
        contentFields: [],
        widgetOptions: {
          latest: MODES_VALUES[CHART_MODES.ALL_LAUNCHES],
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  renderAttributesFieldArray = ({ fields, fieldValidator }) => (
    <AttributesFieldArrayControl
      fields={fields}
      fieldValidator={fieldValidator}
      maxAttributesAmount={MAX_ATTRIBUTES_AMOUNT}
      showRemainingLevels
      url={this.props.itemAttributeKeysAllSearch}
    />
  );

  render() {
    const {
      intl: { formatMessage },
      formAppearance,
      onFormAppearanceChange,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
          />
        </FieldProvider>

        {!formAppearance.isMainControlsLocked && (
          <ScrollWrapper hideTracksWhenNotNeeded autoHeight autoHeightMax={300}>
            <div className={cx('component-header')}>{formatMessage(messages.componentTitle)}</div>
            <FieldProvider name="contentParameters.widgetOptions.latest">
              <TogglerControl
                fieldLabel=" "
                items={getWidgetModeOptions(
                  [CHART_MODES.ALL_LAUNCHES, CHART_MODES.LATEST_LAUNCHES],
                  formatMessage,
                )}
              />
            </FieldProvider>
            <FieldProvider
              name="contentParameters.itemsCount"
              validate={validators.passingRate(formatMessage)}
              format={String}
              normalize={this.normalizeValue}
            >
              <InputControl
                fieldLabel={formatMessage(messages.passingRateFieldLabel)}
                inputWidth={ITEMS_INPUT_WIDTH}
                maxLength="3"
                hintType={'top-right'}
                inputBadge={'%'}
              />
            </FieldProvider>
            <FieldArray
              name="contentParameters.contentFields"
              component={this.renderAttributesFieldArray}
              fieldValidator={validators.attributeKey(formatMessage)}
            />
          </ScrollWrapper>
        )}
      </Fragment>
    );
  }
}