import styled from "styled-components";
import { appTheme } from "../../../project/brand/project";
export const Header = styled.div`
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #e2e4e9;
  margin-bottom: 20px;
  padding: 20px;
  margin: 20px;
  &.hd {
    justify-content: space-between;
    align-items: center;
  }
  @media (min-width: 768px) {
    &.hd {
      display: none;
    }
  }
  @media (max-width: 768px) {
    display: none;
  }
`;
export const Nav = styled.nav`
  padding-top: 0em;
  display: flex;
  flex-direction: column;
  color: gray;
  padding-bottom: 1em;
  /* overflow-y: auto; */
  font-weight: 500;
  padding: 5px 0;
  gap: 4px;
  a.main,
  .open {
    text-decoration: none;
    color: gray;
    height: 35px;
    display: flex;
    justify-content: left;
    align-items: center;
    transition: all 0.02s;
    position: relative;
    margin: 0px;
    border-radius: 8px;
    font-size: 14px;
    gap: 8px;
    min-height: 36px;
    transition: all 0.2s ease-in;
  }
  && {
    .down {
      a.main span,
      .open span {
        padding-right: 1em;
      }
    }
  }

  a.open {
    cursor: unset;
  }
  a.main.active,
  a.main:hover {
    background: #f6f8fa;
    color: ${(props) => props.theme.theme};
    /* box-shadow: rgba(0, 0, 0, 0.16) -1px 0px 4px; */
    font-weight: normal;
    span {
      color: black;
    }
    opacity: 1;
  }
  a.main.active:after {
    content: "";
    display: block;
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    width: 6px;
    height: 6px;
    border-top: 1px solid black;
    border-right: 1px solid black;
    transition: all 0.02s;
  }
  a.main.active::before {
    content: "";
    display: block;
    position: absolute;
    left: 0px;
    background: ${(props) => props.theme.theme};
    width: 5px;
    height: 20px;
    border-radius: 0 10px 10px 0;
    transition: all 0.02s;
  }
  .down a.main.active:first-child,
  .down a.main:hover:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  .down a.main.active:last-child,
  .down a.main:hover:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
  a.main svg,
  .open svg {
    transition: all 0.02s;
    /* width: 20px; */
    margin-left: 14px;
    transition: all 0.2s ease-in;
  }
  a.main.active svg,
  a.main:hover svg {
    transform: scale(1.1);
  }
  @media (max-width: 768px) {
    /* box-shadow: 1px -1px 11px 0 rgba(0, 0, 0, 0.07); */
    border-top: 1px solid ${appTheme.stroke.soft};
    position: fixed;
    bottom: 0;
    /* z-index: 1001; */
    background: white;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    flex-direction: row;
    padding: 0;
    overflow: auto;
    .menu-item {
      padding: 0;
      margin: 0;
      height: 54px;
      width: 20%;
      display: flex;
      align-items: center;
    }
    a.main svg,
    .open svg {
      transition: all 0.02s;
      margin-right: 0px;
      width: 30px;
      margin-left: inherit;
    }
    a.main,
    .open {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      padding: 0;
      width: 70px;
      overflow: hidden;
      height: 50px;
      height: 100%;
      border-radius: 0;
      svg {
      }
      span {
        padding: 0;
        overflow: hidden;
        font-size: 10px;
        white-space: nowrap;
        text-align: center;
        max-width: 95%;
        text-overflow: ellipsis;
      }
    }
    a.main.active:after {
      content: "";
      display: none;
    }
    a.main.active::before {
      content: "";
      display: block;
      position: absolute;
      left: 0px;
      top: 0;
      right: 0;
      background: ${(props) => props.theme.theme};
      width: 100%;
      height: 2px;
      border-radius: 0 10px 10px 0;
      transition: all 0.02s;
    }
  }
`;
export const SubMenuHead = styled.div`
  padding: 10px;
  font-size: 12px;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding-top: 0px;
  &:not(:first-child) {
    margin-top: 15px;
  }
  @media (max-width: 768px) {
    padding: 10px 1em;
    font-weight: bold;
    &.hide {
      display: none;
    }
  }
`;
export const SubMenuOpen = styled.nav`
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  width: calc(20em - 90px);
  min-width: calc(20em - 90px);
  border-right: 1px solid #e2e4e9;
  height: 100%;
  padding: 10px;
  padding-top: 28px;
  gap: 4px;
  overflow: auto;
  a {
    padding: 10px;
    text-decoration: none;
    display: flex;
    gap: 10px;
    text-decoration: none;
    display: flex;
    justify-content: left;
    align-items: center;
    transition: all 0.02s;
    position: relative;
    border-radius: 10px;
    color: black;
    color: gray;
    font-size: 14px;
  }
  a:hover,
  a.active {
    background: #f6f8fa;
    svg {
      color: ${(props) => props.theme.theme};
      font-weight: bold;
    }
    span {
      padding-right: 15px;
      color: black;
    }
  }
  a.active:after {
    content: "";
    display: block;
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px; /* Adjust size as needed */
    height: 20px; /* Adjust size as needed */
    background: white;
    border-radius: 50%;
    /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
    transition: all 0.02s;
    @media (max-width: 768px) {
      height: 1px;
      width: 100%;
      bottom: 0;
      top: auto;
      background-color: ${appTheme.stroke.strong};
      border-radius: 0;
      right: 0;
      left: 0;
    }
  }
  a.active::before {
    content: "";
    position: absolute;
    right: 22px; /* Adjust to center within the circle */
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    width: 6px;
    height: 6px;
    border-top: 2px solid black;
    border-right: 2px solid black;
    z-index: 1;
    transition: all 0.02s;
  }
  @media (max-width: 768px) {
    z-index: 100;
    left: 0;
    right: 0;
    top: 60px;
    width: 100%;
    position: fixed;
    background: white;
    display: flex;
    flex-direction: initial;
    border-bottom: 1px solid rgb(226, 228, 233);
    padding: 0;
    box-shadow: none;
    width: 100%;
    overflow: auto;
    gap: 15px;
    height: 45px;
    padding-right: 0px;
    padding-left: 15px;
    :before {
      content: "";
      display: block;
      border-radius: 3px;
      background: #dbdbdb;
      transition: all 0.02;
      height: 1px;
      margin-left: 0;
      position: absolute;
      margin-top: 1px;
      left: 10px;
      right: 10px;
      display: none;
    }
    a {
      width: auto;
      white-space: nowrap;
      padding: 5px 0.5em;
      color: #9797bc;
      height: 43px;
    }
    a span {
      padding-right: 5px !important;
      color: black;
    }

    a:hover,
    a.active {
      color: ${(props) => props.theme.theme};
      /* font-weight: bold; */
      opacity: 1;
      background: transparent;
      box-shadow: none;
    }
    a.active::before {
      display: none;
    }
  }
`;
export const SubMenu = styled.nav`
  margin-left: 1em;
  margin-right: 1em;
  padding-left: 0em;
  border: 1px solid #f2e5e5;
  border-radius: 12px;
  box-shadow: rgb(0 0 0 / 8%) 0px 0px 10px 2px;
  &.close {
    display: none;
  }
  a {
    border-bottom: 1px solid rgb(241 241 241);
  }
  a:last-child {
    border-bottom: 0;
  }
`;
export const MenuGroup = styled.div`
  cursor: pointer;
  transition: all 0.02s;
  svg:last-child {
    margin-left: auto;
  }
  &.active svg:last-child {
    transform: rotate(180deg) scale(1.1);
    font-weight: bold;
    opacity: 1;
  }
`;
export const MobileSubMenu = styled.div`
  z-index: 100;
  position: fixed;
  left: 0px;
  right: 0px;
  top: 0px;
  width: 100%;
  background: white;

  flex-direction: initial;
  padding: 0px;
  overflow: auto;
  flex-direction: column;
  /* box-shadow: 0px 2px 7px 0 rgba(0, 0, 0, 0.07); */
  border-right: 1px solid #e2e4e9;
  display: none;
  @media (max-width: 768px) {
    display: flex;
    border: 0px solid #e2e4e9;
    border-bottom: 1px solid ${appTheme.stroke.soft};
  }
`;
