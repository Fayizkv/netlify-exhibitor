import React, { useEffect, useRef } from "react";
import CustomSelect from "../select";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button, ColorInput, Controls, Info, Input, InputBox, InputContainer, Label, Line, Slider, TextArea } from "./styles";
import { GetIcon } from "../../../icons";
import Checkbox from "../checkbox";
import MultiSelect from "../multiSelect";
import EditorNew from "../editor";
import InfoBoxItem from "./info";
import { projectSettings } from "../../project/brand/project";
import CustomLabel from "./label";
import ErrorLabel from "./error";
import { SubPageHeader } from "./heading";
import Footnote from "./footnote";
import OnOffToggle from "../toggle";
import { MobileNumber } from "./mobilenumber";
import { FaChevronRight } from "react-icons/fa";
import { IconButton } from "../elements";
import ImageUploader from "./imageUploader";
import SupportedVariables from "../editor/supported";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import VideoUploader from "./videoUploader";
import OptionsInput from "./optionsInput";
import { DateInput, TimeInput, DateTimeInput, MultiDateInput } from "./date";
import MultiForm from "./MultiForm";

const FormInput = React.memo((props) => {
  const { t } = useTranslation();
  const textareaRef = useRef(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (props.value) {
      navigator.clipboard.writeText(props.value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      // Check if textareaRef is not null
      textareaRef.current.style.height = "auto"; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 5}px`; // Set height to scrollHeight
    }
  }, [props.value]); // Dependency array ensures this runs when 'text' changes

  // Get theme colors from Redux store
  const themeColors = useSelector((state) => state.themeColors);

  try {
    switch (props.type) {
      // Render a regular text input
      case "text":
      case "password":
        return (
          <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""} ${projectSettings.formInputView}`} animation={props.animation}>
            <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
            <InfoBoxItem info={props.info} />
            <div className="relative w-full">
              {props.prefix || props.suffix || props.icon ? (
                <div className="group flex items-center w-full h-10 border border-stroke-soft rounded-lg bg-bg-white transition-all duration-200 focus-within:border-stroke-strong focus-within:shadow-[0px_0px_0px_4px_#e4e5e7]">
                  {props.icon?.length > 0 && (
                    <span className="flex items-center justify-center pl-3 text-text-sub">
                      <GetIcon icon={props.icon} />
                    </span>
                  )}
                  {props.prefix && (
                    <span className="flex items-center px-3 text-text-sub text-sm whitespace-nowrap border-r" style={{ borderColor: "#E2E4E9" }}>
                      {props.prefix}
                    </span>
                  )}
                  <Input
                    name={props.name}
                    {...(props.maxLength > 0 ? { maxLength: props.maxLength } : {})}
                    disabled={props.disabled ?? false}
                    autoComplete="on"
                    theme={themeColors}
                    className={`input flex-1 !bg-transparent !border-0 !shadow-none !outline-none !rounded-none ${props.value?.toString().length > 0 ? "shrink" : ""}`}
                    style={{ padding: "10px 12px", borderRadius: 0 }}
                    placeholder={t(props.placeholder)}
                    type={props.type === "password" && !showPassword ? "password" : "text"}
                    value={(() => {
                      // Strip prefix and suffix from display value
                      let displayValue = props.value ?? "";
                      if (props.prefix && displayValue.startsWith(props.prefix)) {
                        displayValue = displayValue.slice(props.prefix.length);
                      }
                      if (props.suffix && displayValue.endsWith(props.suffix)) {
                        displayValue = displayValue.slice(0, -props.suffix.length);
                      }
                      return displayValue;
                    })()}
                    onChange={(event) => {
                      let inputValue = event.target.value;

                      // Append prefix and suffix to the actual value
                      if (inputValue) {
                        if (props.prefix) {
                          inputValue = props.prefix + inputValue;
                        }
                        if (props.suffix) {
                          inputValue = inputValue + props.suffix;
                        }
                      }

                      // Convert to lowercase if it's an email field (either by type or validation)
                      if (props.type === "email" || props.validation === "email") {
                        inputValue = inputValue.toLowerCase();
                      }

                      props.onChange({ ...event, target: { ...event.target, value: inputValue } }, props.id, props.type, props.sub);
                    }}
                  />
                  {props.suffix && (
                    <span className="flex items-center px-3 text-text-sub text-sm whitespace-nowrap border-l" style={{ borderColor: "#E2E4E9" }}>
                      {props.suffix}
                    </span>
                  )}
                  {props.copy && props.value && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="pr-3 text-text-sub hover:text-primary-base transition-all opacity-0 group-hover:opacity-100"
                      title={copied ? "Copied!" : "Copy"}
                    >
                      {copied ? <Check size={16} color="#868686" /> : <Copy size={16} color="#868686" />}
                    </button>
                  )}
                  {props.type === "password" && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-3 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff size={16} color="#868686" /> : <Eye size={16} color="#868686" />}
                    </button>
                  )}
                </div>
              ) : (
                <div className="group relative w-full">
                  <Input
                    name={props.name}
                    {...(props.maxLength > 0 ? { maxLength: props.maxLength } : {})}
                    disabled={props.disabled ?? false}
                    autoComplete="on"
                    theme={themeColors}
                    className={`input ${props.value?.toString().length > 0 ? "shrink" : ""} ${props.icon?.length > 0 ? "has-icon" : ""}`}
                    placeholder={t(props.placeholder)}
                    type={props.type === "password" && !showPassword ? "password" : "text"}
                    value={props.value ?? ""}
                    onChange={(event) => {
                      // Convert to lowercase if it's an email field (either by type or validation)
                      if (props.type === "email" || props.validation === "email") {
                        const lowerCaseEmail = event.target.value.toLowerCase();
                        props.onChange({ ...event, target: { ...event.target, value: lowerCaseEmail } }, props.id, props.type, props.sub);
                      } else {
                        props.onChange(event, props.id, props.type, props.sub);
                      }
                    }}
                  />
                  {props.copy && props.value && props.type !== "password" && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-sub hover:text-primary-base transition-all opacity-0 group-hover:opacity-100"
                      title={copied ? "Copied!" : "Copy"}
                    >
                      {copied ? <Check size={16} color="#868686" /> : <Copy size={16} color="#868686" />}
                    </button>
                  )}
                  {props.type === "password" && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff size={16} color="#868686" /> : <Eye size={16} color="#868686" />}
                    </button>
                  )}
                </div>
              )}
            </div>
            <ErrorLabel error={props.error} info={props.info} />
            <Footnote {...props} />
          </InputContainer>
        );
      case "email":
        return (
          <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""} ${projectSettings.formInputView}`} animation={props.animation}>
            <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
            <InfoBoxItem info={props.info} />
            <div className="relative w-full">
              <Input
                name={props.name}
                {...(props.maxLength > 0 ? { maxLength: props.maxLength } : {})}
                disabled={props.disabled ?? false}
                autoComplete="on"
                theme={themeColors}
                className={`input ${props.value?.toString().length > 0 ? "shrink" : ""} ${props.icon?.length > 0 ? "has-icon" : ""}`}
                placeholder={t(props.placeholder)}
                type="email"
                value={props.value ?? ""}
                onChange={(event) => {
                  const lowerCaseEmail = event.target.value.toLowerCase();
                  props.onChange({ ...event, target: { ...event.target, value: lowerCaseEmail } }, props.id, props.type, props.sub);
                }}
              />
            </div>
            {props.icon?.length > 0 && <GetIcon icon={props.icon}></GetIcon>}

            <ErrorLabel error={props.error} info={props.info} />
            <Footnote {...props} />
          </InputContainer>
        );
      case "range":
        return (
          <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""} ${projectSettings.formInputView}`} animation={props.animation}>
            <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
            <InfoBoxItem info={props.info} />
            {props.icon?.length > 0 && <GetIcon icon={props.icon}></GetIcon>}
            <Slider
              name={props.name}
              {...(props.maxLength > 0 ? { maxLength: props.maxLength } : {})}
              disabled={props.disabled ?? false}
              autoComplete="on"
              theme={themeColors}
              className={`input ${props.value?.toString().length > 0 ? "shrink" : ""} ${props.icon?.length > 0 ? "has-icon" : ""}`}
              placeholder={t(props.placeholder)}
              type={props.type}
              value={props.value ?? ""}
              min={props.min}
              max={props.max}
              onChange={(event) => props.onChange(event, props.id, props.type, props.sub)}
            />
            <ErrorLabel error={props.error} info={props.info} />
            <Footnote {...props} />
          </InputContainer>
        );
      case "color":
        return (
          <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""} ${projectSettings.formInputView}`} animation={props.animation}>
            <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
            <InfoBoxItem info={props.info} />
            {props.icon?.length > 0 && <GetIcon icon={props.icon}></GetIcon>}
            <ColorInput
              name={props.name}
              {...(props.maxLength > 0 ? { maxLength: props.maxLength } : {})}
              disabled={props.disabled ?? false}
              autoComplete="on"
              theme={themeColors}
              className={`input ${props.value?.toString().length > 0 ? "shrink" : ""} ${props.icon?.length > 0 ? "has-icon" : ""}`}
              placeholder={t(props.placeholder)}
              type={props.type}
              value={props.value ?? ""}
              min={props.min}
              max={props.max}
              onChange={(event) => props.onChange(event, props.id, props.type, props.sub)}
            />
            <ErrorLabel error={props.error} info={props.info} />
            <Footnote {...props} />
          </InputContainer>
        );
      case "buttonInput":
        return (
          <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""} ${projectSettings.formInputView}`} animation={props.animation}>
            <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
            <InfoBoxItem info={props.info} />
            {props.icon?.length > 0 && <GetIcon icon={props.icon}></GetIcon>}
            <InputBox>
              <Input
                name={props.name}
                {...(props.maxLength > 0 ? { maxLength: props.maxLength } : {})}
                disabled={props.disabled ?? false}
                autoComplete="on"
                theme={themeColors}
                className={`input buttonText ${props.value?.toString().length > 0 ? "shrink" : ""} ${props.icon?.length > 0 ? "has-icon" : ""}`}
                placeholder={t(props.placeholder)}
                type={"text"}
                value={props.value ?? ""}
                onChange={(event) => props.onChange(event, props.id, props.type, props.sub)}
              />
              <Button theme={themeColors} className={props.customClass + " buttonText " + (props.status ? "active" : "")} disabled={props.disabled} type={props.type} onClick={props.onClick}>
                <span> {props.text}</span>
              </Button>
            </InputBox>
            <Footnote {...props} />
            <ErrorLabel error={props.error} info={props.info} />
            <ErrorLabel error={props.success} className="success" icon={"success"} />
          </InputContainer>
        );
      case "number":
        const value = isNaN(props.value) ? "" : props.value;
        const handleKeyDown = (event) => {
          if (event.keyCode === 38 || event.keyCode === 40) {
            // Prevent the default behavior for up and down arrow keys
            console.log("event", "aborted");
            event.preventDefault();
          }
        };
        return (
          <InputContainer className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""} ${props.customClass ?? ""}`} animation={props.animation}>
            <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} value={props.value} error={props.error} />
            <InfoBoxItem info={props.info} />
            {props.icon?.length > 0 && <GetIcon icon={props.icon}></GetIcon>}
            <Input
              disabled={props.disabled ?? false}
              onKeyDown={handleKeyDown} // Attach the onKeyDown event handler
              onWheel={(e) => e.target.blur()}
              autoComplete="on"
              theme={themeColors}
              className={`number input ${value?.toString().length > 0 ? "shrink" : ""} ${props.icon?.length > 0 ? "has-icon" : ""}`}
              placeholder={t(props.placeholder)}
              type={props.type}
              value={value}
              onChange={(event) => props.onChange(event, props.id, props.type, props.sub)}
              min={0}
              maxLength={props.maximum}
              name={props.name}
            />
            <Controls className="control">
              <IconButton
                align="plain"
                icon="minus"
                ClickEvent={(event) => props.onChange({ target: { value: parseFloat((value - (props.addValue ?? 1)).toFixed(1)) } }, props.id, props.type, props.sub)}
              ></IconButton>
              <IconButton
                align="plain"
                icon="add"
                ClickEvent={(event) => props.onChange({ target: { value: parseFloat((value + (props.addValue ?? 1)).toFixed(1)) } }, props.id, props.type, props.sub)}
              ></IconButton>
            </Controls>
            <ErrorLabel error={props.error} info={props.info} />
            <Footnote {...props} />
          </InputContainer>
        );
      case "mobilenumber":
        return <MobileNumber {...props} themeColors={themeColors} />;
      case "time":
        return <TimeInput {...props} theme={themeColors} />;
      case "date":
        return <DateInput {...props} theme={themeColors} />;
      case "datetime":
        return <DateTimeInput {...props} theme={themeColors} />;
      case "multidate":
        return <MultiDateInput {...props} theme={themeColors} />;
      case "image":
      case "file":
        return <ImageUploader {...props}></ImageUploader>;
      case "video":
        return <VideoUploader {...props}></VideoUploader>;
      case "options":
        return <OptionsInput {...props}></OptionsInput>;
      case "textarea":
        return (
          <InputContainer className={`${props.customClass ?? ""} textarea ${props.dynamicClass ?? ""}`}>
            <InfoBoxItem info={props.info} />
            <CustomLabel label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
            <TextArea
              disabled={props.disabled}
              name={props.name}
              ref={textareaRef}
              theme={themeColors}
              className={`input ${props?.value?.length > 0 ? "shrink" : ""}  ${props.size ?? ""}`}
              placeholder={t(props.placeholder)}
              value={props.value}
              onChange={(event) => props.onChange(event, props.id)}
            />
            <SupportedVariables supportedVariables={props.supportedVariables} />
            <ErrorLabel error={props.error} info={props.info} />
            <Footnote {...props} />
          </InputContainer>
        );
      case "htmleditor":
        return (
          <EditorNew
            supportedVariables={props.supportedVariables}
            disabled={props.disabled}
            dynamicClass={`${props.dynamicClass ?? ""}`}
            key={props.id}
            type={props.type}
            placeholder={props.placeholder}
            value={props.value}
            id={props.id}
            onChange={props.onChange}
            footnote={props.footnote}
            footnoteicon={props.footnoteicon}
          ></EditorNew>
        );
      case "submit":
        return (
          <Button disabled={props.disabled} colors={props.colors} theme={themeColors} className={"submit " + props.css} type={props.type} onClick={props.onChange}>
            {props.icon ? <GetIcon icon={props.icon}></GetIcon> : null}
            {props.value}
          </Button>
        );
      case "button":
        return (
          <Button disabled={props.disabled} theme={themeColors} className={props.customClass} type={props.type} onClick={props.onChange}>
            {props.icon ? <GetIcon icon={props.icon}></GetIcon> : null}
            <span> {props.value}</span>
          </Button>
        );
      case "content-card":
        return (
          <Button disabled={props.disabled} theme={themeColors} className={props.customClass} type={props.type} onClick={props.onChange}>
            {props.icon ? <GetIcon icon={props.icon}></GetIcon> : null}
            <span> {props.value}</span>
          </Button>
        );
      case "linkbutton":
        return (
          <Button disabled={props.disabled} theme={themeColors} className={"linkbutton " + (props.customClass ?? "")} type={props.type} onClick={props.onChange}>
            {props.icon ? <GetIcon icon={props.icon}></GetIcon> : null}
            <span> {props.value}</span>
          </Button>
        );
      case "widges":
        return (
          <Button
            disabled={props.disabled}
            theme={themeColors}
            className={"widges"}
            type={props.type}
            onClick={props.onChange}
            style={{
              border: props.isSelected ? "2px solid #375DFB" : "1px solid #ccc",
            }}
          >
            {props.icon ? <GetIcon icon={props.icon}></GetIcon> : null}
            <span style={{ fontSize: "12px" }}> {props.value}</span>
          </Button>
        );
      case "badge-card":
        return (
          <InputContainer className={`${props.customClass ?? ""}  badge-card`} type={props.type} theme={themeColors}>
            <div className="icon-container circular">{props.icon ? <GetIcon icon={props.icon}></GetIcon> : null}</div>
            <div className="text-container">
              {props?.label ? <span>{props?.label}</span> : null}
              {props?.footnote ? <p>{props?.footnote}</p> : null}
            </div>
            <div className="badge-radio">{props.buttonType === "radio" ? <input type="radio" name="badgeType" className="right-radio" /> : <FaChevronRight className="right-arrow" />} </div>
          </InputContainer>
        );
      case "close":
        return (
          <Button disabled={props.disabled ?? false} theme={themeColors} className={"close " + props.className} type={props.type} onClick={props.onChange}>
            {props.value}
          </Button>
        );
      case "checkbox":
        return (
          <InputContainer className={`checkbox ${props.dynamicClass ?? ""} ${props.customClass ?? ""} `}>
            <InfoBoxItem info={props.info} />
            <Label className="checkbox">
              <Checkbox
                disabled={props.disabled}
                name={props.name}
                theme={themeColors}
                label={t(props.label)}
                className={"checkbox " + props.customClass}
                type={props.type}
                checked={props.value ?? false}
                sublabel={props.sublabel}
                onChange={(event) => {
                  props.onChange(event.target.checked === false ? false : true, props.id, props.type);
                }}
              ></Checkbox>
            </Label>
            <ErrorLabel error={props.error} info={props.info} />
            <Footnote {...props} className="checkbox" />
          </InputContainer>
        );
      case "toggle":
        return (
          <InputContainer className={`checkbox ${props.dynamicClass ?? ""} ${props.customClass ?? ""} `}>
            <InfoBoxItem info={props.info} />
            <OnOffToggle
              label={props.label}
              description={props.footnote}
              on={props.value ?? false}
              handleToggle={(status) => {
                console.log(status);
                props.onChange(status, props.id, props.type);
              }}
            />
            <ErrorLabel error={props.error} info={props.info} />
          </InputContainer>
        );
      case "select":
        return <CustomSelect theme={themeColors} {...props} name={props.id} selected={props.value} onSelect={props.onChange}></CustomSelect>;
      case "timezone":
        // Generate timezone options for the select
        const getTimezoneOptions = () => {
          try {
            const timezones = Intl.supportedValuesOf("timeZone");
            const timezoneData = timezones.map((tz) => {
              const parts = tz.split("/");
              const region = parts[0];
              const city = parts.slice(1).join("/").replace(/_/g, " ");

              // Get timezone offset and name
              const now = new Date();
              const offset = now
                .toLocaleString("en", {
                  timeZone: tz,
                  timeZoneName: "longOffset",
                })
                .split(" ")
                .pop();

              // Get full timezone name (e.g., "India Standard Time")
              const timezoneName = now
                .toLocaleString("en", {
                  timeZone: tz,
                  timeZoneName: "longGeneric",
                })
                .split(",")
                .pop()
                .trim()
                .split(" ")
                .slice(2)
                .join(" ");

              // Parse offset for sorting (convert to minutes)
              const parseOffset = (offsetStr) => {
                const match = offsetStr.match(/([+-])(\d{2}):(\d{2})/);
                if (!match) return 0;
                const sign = match[1] === "+" ? 1 : -1;
                const hours = parseInt(match[2]);
                const minutes = parseInt(match[3]);
                return sign * (hours * 60 + minutes);
              };

              // City display mapping for timezones (show multiple major cities)
              const cityDisplayMap = {
                "Asia/Calcutta": "Chennai, Kolkata, Mumbai, New Delhi",
                "America/New_York": "New York, Detroit, Atlanta",
                "America/Los_Angeles": "Los Angeles, San Francisco, Seattle",
                "America/Chicago": "Chicago, Houston, Dallas",
                "Europe/London": "London, Edinburgh, Dublin",
                "Australia/Sydney": "Sydney, Melbourne, Canberra",
              };

              // Get custom city display or use the parsed city name
              const cityDisplay = cityDisplayMap[tz] || city;

              // Format: "India Standard Time - Chennai, Kolkata, Mumbai, New Delhi GMT+05:30"
              // This makes it searchable by timezone name, cities, and GMT offset
              const formattedOffset = offset.replace(/GMT/, "GMT");
              const displayName = timezoneName && cityDisplay ? `${timezoneName} - ${cityDisplay} ${formattedOffset}` : `${tz} ${formattedOffset}`;

              return {
                id: tz,
                value: displayName,
                offsetMinutes: parseOffset(offset),
              };
            });

            // Sort by timezone offset
            return timezoneData.sort((a, b) => a.offsetMinutes - b.offsetMinutes).map(({ id, value }) => ({ id, value }));
          } catch (error) {
            // Fallback for older browsers
            return [
              { id: "America/Los_Angeles", value: "Pacific Time - Los Angeles, San Francisco, Seattle GMT-08:00" },
              { id: "America/New_York", value: "Eastern Time - New York, Detroit, Atlanta GMT-05:00" },
              { id: "UTC", value: "Coordinated Universal Time GMT+00:00" },
              { id: "Europe/London", value: "United Kingdom Time - London, Edinburgh, Dublin GMT+00:00" },
              { id: "Europe/Paris", value: "Central European Time - Paris GMT+01:00" },
              { id: "Asia/Calcutta", value: "India Standard Time - Chennai, Kolkata, Mumbai, New Delhi GMT+05:30" },
              { id: "Asia/Tokyo", value: "Japan Standard Time - Tokyo GMT+09:00" },
            ];
          }
        };

        const timezoneProps = {
          ...props,
          apiType: "JSON",
          selectApi: getTimezoneOptions(),
          apiSearch: true,
        };

        return <CustomSelect theme={themeColors} {...timezoneProps} name={props.id} selected={props.value} search={true} onSelect={props.onChange}></CustomSelect>;
      case "multiSelect":
        return <MultiSelect theme={themeColors} {...props} name={props.id} selected={props.value} onSelect={props.onChange}></MultiSelect>;
      case "info":
        return (
          <Info className={`${props.customClass ?? "full"}  ${props.dynamicClass}`}>
            <GetIcon icon={"info"}></GetIcon>
            <span dangerouslySetInnerHTML={{ __html: props.content }}></span>
          </Info>
        );
      case "html":
        return (
          <Info className={`${props.customClass ?? "full"} ${props.dynamicClass}`}>
            <span dangerouslySetInnerHTML={{ __html: props.content }}></span>
          </Info>
        );
      case "line":
        return <Line className={`${props.dynamicClass}`}></Line>;
      case "label":
        return (
          <CustomLabel
            className={`${props.customClass ?? ""} ${props.dynamicClass ?? ""}`}
            label={props.label}
            required={props.required}
            description={props.info ?? null}
            sublabel={props.sublabel}
            error={props.error ?? ""}
          />
        );
      case "title":
        return (
          <SubPageHeader
            dynamicClass={`${props.customClass ?? ""} ${props.dynamicClass ?? ""}`}
            margin={false}
            line={props.line ?? true}
            icon={props.icon}
            title={props.title}
            description={props.info}
          ></SubPageHeader>
        );
      case "element":
        return (
          <div className={`${props.dynamicClass.includes("disabled") ? "hidden" : ""} w-full flex flex-col gap-4 col-span-12`}>
            {props.element(
              { ...props, params: props.params.reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {}), parentReference: props.parentReference, referenceId: props.referenceId },
              props.onChange
            )}{" "}
            {props.showError ? <ErrorLabel error={props.error} info={props.info} /> : null}
          </div>
        );
      case "titleswitch":
        return (
          <InputContainer className={`titleswitch ${props.customClass ?? ""} ${props.dynamicClass ?? ""}`}>
            <div className="flex items-center justify-between w-full gap-4">
              {props.label ? (
                <CustomLabel name={props.name} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />
              ) : (
                <div className="flex flex-col">
                  <h3 className="text-text-main font-semibold text-lg m-0 p-0">{props.title}</h3>
                  {props.description && <span className="text-text-sub text-sm mt-1">{props.description}</span>}
                </div>
              )}
              <div className="flex items-center gap-1 bg-bg-weak rounded-lg p-0">
                {props.tabs?.map((tab, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => props.onChange(tab.value, props.id, props.type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      props.value?.toString() === tab.value?.toString() ? "bg-primary-base text-white shadow-sm" : "bg-transparent text-text-main hover:bg-bg-weak"
                    }`}
                  >
                    {tab.icon && <GetIcon icon={tab.icon} />}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <ErrorLabel error={props.error} info={props.info} />
            <Footnote {...props} />
          </InputContainer>
        );
      case "hidden":
        return (
          <Input
            disabled={props.disabled ?? false}
            autoComplete="on"
            theme={themeColors}
            className={`input ${props.value?.toString().length > 0 ? "shrink" : ""}`}
            placeholder={t(props.placeholder)}
            type={props.type}
            value={props.value}
            onChange={(event) => props.onChange(event, props.id, props.type, props.sub)}
          />
        );
      case "multiForm":
        return (
          <InputContainer className={` ${props.customClass ?? ""} ${props.dynamicClass ?? ""}`}>
            <MultiForm {...props} parentData={props.formValues} themeColors={themeColors} />
          </InputContainer>
        );

      default:
        return <></>;
    }
  } catch (err) {
    console.log(err);
    return <></>;
  }
});
export default FormInput;
