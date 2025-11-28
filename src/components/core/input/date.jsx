import React from "react";
import { createPortal } from "react-dom";
import { DatetimeInput, InputContainer } from "./styles";
import { GetIcon } from "../../../icons";
import moment from "moment";
import "moment-timezone";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CustomLabel from "./label";
import InfoBoxItem from "./info";
import ErrorLabel from "./error";
import Footnote from "./footnote";
import MultiDatePicker from "react-multi-date-picker";
import { getValue } from "../list/functions";
// import TimePickerColumns from "./TimePickerColumns";

// Common function to convert UTC datetime to selected timezone for display
const convertUtcToTimezoneForDisplay = (utcValue, timeZone) => {
  if (typeof utcValue === "undefined" || utcValue === null || utcValue.length === 0) {
    return null;
  }

  try {
    // Parse the UTC time and convert to selected timezone
    const utcMoment = moment.utc(utcValue);
    const localMoment = utcMoment.tz(timeZone);

    // if (isDateTimeMode)
    // For datetime, return the full converted date, which is correct.
    return moment(localMoment.format("YYYY-MM-DD HH:mm:ss")).toDate();
  } catch (error) {
    console.error("Error converting time to timezone:", error);
    return new Date(utcValue);
  }
};

const convertLocalToUtc = (localDate, timeZone) => {
  if (!localDate || !timeZone) {
    return localDate;
  }
  try {
    const localMoment = moment(localDate);
    const targetMoment = moment.tz(
      {
        year: localMoment.year(),
        month: localMoment.month(),
        date: localMoment.date(),
        hour: localMoment.hour(),
        minute: localMoment.minute(),
        second: localMoment.second(),
      },
      timeZone
    );
    return targetMoment.utc().toISOString();
  } catch (error) {
    console.error("Error converting local time to UTC:", error);
    return localDate;
  }
};

// Hook to get timezone info from Redux
const useTimezoneInfo = (overrideTimezone = null) => {
  const timezoneState = useSelector((state) => state.timezone);

  try {
    // Determine active timezone
    const activeTimezone = overrideTimezone || (timezoneState?.isActive ? timezoneState.eventTimezone : null);

    const targetTimezone = activeTimezone || (moment.tz ? moment.tz.guess() : Intl.DateTimeFormat().resolvedOptions().timeZone);

    if (moment.tz) {
      const offset = moment.tz(targetTimezone).format("Z");
      const gmtOffset = `GMT${offset}`;

      return {
        zone: targetTimezone,
        abbr: moment.tz(targetTimezone).format("z"),
        name: targetTimezone.replace(/_/g, " "),
        offset: gmtOffset,
        isEventTimezone: !!activeTimezone,
      };
    }

    // Fallback to native JavaScript
    const date = new Date();
    const offset = (-date.getTimezoneOffset() / 60).toFixed(2);
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset);
    const minutes = Math.round((absOffset - hours) * 60);
    const gmtOffset = `GMT${offset >= 0 ? "+" : "-"}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    return {
      zone: targetTimezone,
      abbr: new Date().toLocaleTimeString("en-us", { timeZoneName: "short" }).split(" ")[2],
      name: targetTimezone.replace(/_/g, " "),
      offset: gmtOffset,
      isEventTimezone: !!activeTimezone,
    };
  } catch (e) {
    return {
      zone: "UTC",
      abbr: "UTC",
      name: "Coordinated Universal Time",
      offset: "GMT+00:00",
      isEventTimezone: false,
    };
  }
};
const DatePickerPortalContainer = ({ children }) => {
  return typeof document !== "undefined" ? createPortal(children, document.body) : children;
};

const getDatePickerConfig = () => ({
  popperContainer: DatePickerPortalContainer,
  popperClassName: "datepicker-popper",
  popperPlacement: "bottom-start",
});

export const DateInput = (props) => {
  const { t } = useTranslation();
  const userFriendlyDate = typeof props.value === "undefined" || props.value === null ? null : props.value.length > 0 ? new Date(props.value) : null;
  const minDate = props.minDate ? new Date(props.minDate) : null;
  const maxDate = props.maxDate ? new Date(props.maxDate) : null;

  return (
    <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""} ${props.customClass ?? ""}`}>
      {(props.showLabel ?? true) ? <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} /> : null}
      <InfoBoxItem info={props.info} />
      <div className="relative w-full">
        <DatetimeInput
          {...getDatePickerConfig()}
          disabled={props.disabled}
          name={props.name}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          yearDropdownItemNumber={10}
          scrollableYearDropdown
          minDate={minDate}
          maxDate={maxDate}
          dateFormat={"yyyy-MM-dd"}
          theme={props.theme}
          className={`input w-full ${props.value?.length > 0 ? "shrink" : ""}  ${props.icon?.length > 0 ? "has-icon" : ""}`}
          placeholderText={t(props.placeholder)}
          type={props.type}
          value={userFriendlyDate}
          selected={userFriendlyDate}
          onChange={(event) => props.onChange(event, props.id, props.type)}
          isClearable={true}
          showPopperArrow={true}
          calendarStartDay={1}
          fixedHeight
          formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 2)}
        />
        {props.icon?.length > 0 && (
          <div className="icon-container absolute top-[10px] left-[10px]">
            <GetIcon icon={props.icon} />
          </div>
        )}
      </div>
      <ErrorLabel error={props.error} info={props.info} />
      <Footnote {...props} />
    </InputContainer>
  );
};

export const TimeInput = (props) => {
  const { t } = useTranslation();
  const { zone: timeZone, name: timeZoneName, offset: timeZoneOffset, isEventTimezone } = useTimezoneInfo();
  const customClass = props.customClass || "";

  // Convert UTC time to selected timezone for display
  const userFriendlyTime = React.useMemo(() => {
    return convertUtcToTimezoneForDisplay(props.value, timeZone);
  }, [props.value, timeZone]);

  return (
    <InputContainer className={`${customClass} ${props.dynamicClass ?? ""}`}>
      <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
      <InfoBoxItem info={props.info} />
      <div className="relative w-full">
        <DatetimeInput
          {...getDatePickerConfig()}
          disabled={props.disabled}
          name={props.name}
          theme={props.theme}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption={`Time (${timeZoneName})`}
          selected={userFriendlyTime}
          dateFormat="h:mm aa"
          className={`input w-full ${props.value?.length > 0 ? "shrink" : ""} ${props.icon?.length > 0 ? "has-icon" : ""}`}
          placeholderText={t(props.placeholder)}
          type={props.type}
          isClearable={true}
          onChange={(date) => props.onChange(convertLocalToUtc(date, timeZone), props.id, props.type)}
        />
        <div className="icon-container absolute top-[10px] left-[10px]">
          <GetIcon icon="time" />
        </div>
      </div>
      {/* Only show timezone if showTimezone prop is not explicitly set to false */}
      {(props.showTimezone !== false) && !props.hideTimezone && (
        <div className={`mt-2 text-xs flex items-center gap-2 ${isEventTimezone ? "text-blue-600" : "text-gray-500"}`}>
          <span>{customClass.includes("half") || customClass.includes("quarter") ? timeZoneOffset : `${timeZoneName} (${timeZoneOffset})`}</span>
        </div>
      )}
      <ErrorLabel error={props.error} info={props.info} />
      <Footnote {...props} />
    </InputContainer>
  );
};

export const DateTimeInput = (props) => {
  const { t } = useTranslation();
  const { zone: timeZone, abbr: dateTimeZoneAbbr, name: dateTimeZoneName, offset: dateTimeZoneOffset, isEventTimezone } = useTimezoneInfo();
  const minDate = props.minDate ? new Date(props.minDate) : null;
  const maxDate = props.maxDate ? new Date(props.maxDate) : null;

  // Convert UTC datetime to selected timezone for display
  const userFriendlyDateTime = React.useMemo(() => {
    return convertUtcToTimezoneForDisplay(props.value, timeZone);
  }, [props.value, timeZone]);

  return (
    <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""}`}>
      <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
      <InfoBoxItem info={props.info} />
      {props.split ? (
        <>
          <div className="datetime-container flex gap-2 w-full">
            <div className="date-container relative flex-1">
              <DatetimeInput
                {...getDatePickerConfig()}
                disabled={props.disabled}
                name={props.name}
                showYearDropdown
                showMonthDropdown
                yearDropdownItemNumber={70}
                scrollableYearDropdown
                minDate={minDate}
                maxDate={maxDate}
                dateFormat={"yyyy-MM-dd"}
                theme={props.theme}
                className={`input w-full ${props.value?.length > 0 ? "shrink" : ""}  has-icon`}
                placeholderText={t(props.placeholder)}
                type={props.type}
                value={userFriendlyDateTime}
                selected={userFriendlyDateTime}
                onChange={(date) => props.onChange(convertLocalToUtc(date, timeZone), props.id, props.type)}
                showPopperArrow={false}
                calendarStartDay={1}
              />
              <div className="icon-container absolute top-[10px] left-[10px]">
                <GetIcon icon="date" />
              </div>
            </div>
            <div className="time-container relative flex-1">
              <DatetimeInput
                {...getDatePickerConfig()}
                disabled={props.disabled}
                name={props.name}
                theme={props.theme}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption={`Time (${dateTimeZoneAbbr})`}
                selected={userFriendlyDateTime}
                dateFormat="h:mm aa"
                className={`input w-full ${props.value?.length > 0 ? "shrink" : ""} has-icon`}
                placeholderText={t(props.placeholder)}
                type={props.type}
                onChange={(date) => props.onChange(convertLocalToUtc(date, timeZone), props.id, props.type)}
                isClearable={true}
              />
              <div className="icon-container absolute top-[10px] left-[10px]">
                <GetIcon icon="time" />
              </div>
            </div>
          </div>
          <div className={`text-xs mt-1 flex items-center gap-2 ${isEventTimezone ? "text-blue-600" : "text-gray-500"}`}>
            <span>
              {dateTimeZoneName} ({dateTimeZoneOffset})
            </span>
          </div>
        </>
      ) : (
        <div className="datetime-container relative w-full">
          <DatetimeInput
            {...getDatePickerConfig()}
            disabled={props.disabled}
            name={props.name}
            showYearDropdown
            showMonthDropdown
            yearDropdownItemNumber={70}
            scrollableYearDropdown
            minDate={minDate}
            maxDate={maxDate}
            theme={props.theme}
            showTimeSelect
            timeIntervals={15}
            timeFormat="HH:mm"
            timeCaption={`Time (${dateTimeZoneAbbr})`}
            className={`input w-full ${props.value?.length > 0 ? "shrink" : ""}  ${props.icon?.length > 0 ? "has-icon" : ""}`}
            placeholderText={t(props.placeholder)}
            type={props.type}
            value={userFriendlyDateTime}
            selected={userFriendlyDateTime}
            dateFormat={`yyyy-MM-dd HH:mm (${dateTimeZoneAbbr})`}
            onChange={(date) => props.onChange(convertLocalToUtc(date, timeZone), props.id, props.type)}
            isClearable={!props.required}
            showPopperArrow={false}
            calendarStartDay={1}
          />
          {props.icon?.length > 0 && (
            <div className="icon-container absolute top-[10px] left-[10px]">
              <GetIcon icon={props.icon} />
            </div>
          )}
        </div>
      )}
      <ErrorLabel error={props.error} info={props.info} />
      <Footnote {...props} />
    </InputContainer>
  );
};

export const MultiDateInput = (props) => {
  const [selectedDates, setSelectedDates] = React.useState(props.value || []);

  return (
    <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""}`}>
      {(props.showLabel ?? true) ? <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} /> : null}
      <InfoBoxItem info={props.info} />
      <div className="relative w-full">
        <MultiDatePicker
          value={selectedDates}
          onChange={(dates) => {
            setSelectedDates(dates);
            if (props.onChange) props.onChange(dates);
          }}
          minDate={props.minDate}
          maxDate={props.maxDate}
          format="YYYY-MM-DD"
          multiple
          range={props.range}
          placeholder={props.placeholder}
          className="input w-full"
        />
      </div>
      <ErrorLabel error={props.error} info={props.info} />
      <Footnote {...props} />
    </InputContainer>
  );
};
